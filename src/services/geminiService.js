function extractJson(text) {
  if (!text) return null;
  const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)```/i);
  const raw = codeBlockMatch ? codeBlockMatch[1] : text;
  // Try array first
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }
  return null;
}

export async function generateSubtasks(taskDescription, dueDate, userProfile) {
  // Deprecated in favor of schema-driven plan. Kept for compatibility if needed elsewhere.
  const prompt = `Break down this task into smaller subtasks: "${taskDescription}". Each subtask should be 15-45 minutes. Return ONLY a JSON array of objects with exact keys: title (string), estMinutes (number), difficulty (1,2,3). Consider user focus length: ${userProfile?.focusLength || 25} minutes.`;

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model: 'gemini-1.5-flash' })
  });

  const raw = await res.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini error');

  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || '';
  const parsed = extractJson(text);
  if (Array.isArray(parsed)) return parsed;
  return [];
}

export async function generatePlan({ userInput, duration, timeWindow }) {
  const jsonSchema = {
    type: 'object',
    properties: {
      plan_title: { type: 'string' },
      days: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            day_title: { type: 'string' },
            tasks: {
              type: 'array',
              minItems: 2,
              maxItems: 4,
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  time_slot: { type: 'string' },
                  duration: { type: 'integer' },
                  difficulty: { type: 'string', enum: ['Easy','Medium','Hard'] },
                  xp: { type: 'integer' },
                  steps: { type: 'array', minItems: 5, maxItems: 7, items: { type: 'string' } }
                },
                required: ['title','time_slot','duration','difficulty','xp','steps']
              }
            }
          },
          required: ['day_title','tasks']
        }
      },
      summary: {
        type: 'object',
        properties: {
          total_tasks: { type: 'integer' },
          difficulty_breakdown: { type: 'object' },
          total_xp: { type: 'integer' },
          total_time: { type: 'integer' },
          notes: { type: 'array', items: { type: 'string' } }
        },
        required: ['total_tasks','difficulty_breakdown','total_xp','total_time','notes']
      }
    },
    required: ['plan_title','days','summary']
  };

  const prompt = `You are a productivity AI for TruFloApp.com, designed to generate structured task plans that promote a flow state. Given the user input: "${userInput}", generate a study or work plan for ${duration} for the user's available time window (${timeWindow}). Break it down into 2-4 tasks per day to fit within the time window, including 5-minute breaks between tasks.\n\nFollow these rules:\n1. Start with an Easy task, then Medium, end with Hard or Easy. Never three tasks of the same difficulty.\n2. Vary number of tasks (2-4).\n3. Each task must include: title, time_slot (12-hour), duration (minutes), difficulty (Easy/Medium/Hard), xp (10/20/30), steps (5-7).\n4. Ensure tasks are challenging yet achievable.\n5. Output in strict JSON format adhering to the provided schema. Do not include any text outside the JSON object.`;

  // Try edge route first
  let res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      model: 'gemini-1.5-flash',
      schema: JSON.stringify(jsonSchema),
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    })
  });

  if (res.status === 404) {
    // Dev fallback direct proxy
    res = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nJSON Schema (enforce strictly):\n${JSON.stringify(jsonSchema)}` }] }],
        generationConfig: { response_mime_type: 'application/json', temperature: 0.7, maxOutputTokens: 2000 }
      })
    });
  }

  const raw = await res.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini error');

  const parts = data?.candidates?.[0]?.content?.parts || [];
  // Try inlineData (base64 JSON)
  let plan = null;
  const inline = parts.find(p => p.inlineData && p.inlineData.mimeType === 'application/json');
  if (inline?.inlineData?.data) {
    try { plan = JSON.parse(atob(inline.inlineData.data)); } catch {}
  }
  // Try text content containing JSON
  if (!plan) {
    const text = parts.map(p => p.text || '').join('\n');
    try { plan = text ? JSON.parse(text) : null; } catch {}
    if (!plan) {
      const obj = extractJson(text);
      if (obj) plan = obj;
    }
  }

  if (!plan || !plan.plan_title || !Array.isArray(plan.days) || !plan.summary) throw new Error('Invalid plan format');
  return plan;
}
