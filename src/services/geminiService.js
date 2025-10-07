function extractJson(text) {
  if (!text) return null;
  const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)```/i);
  const raw = codeBlockMatch ? codeBlockMatch[1] : text;

  // Try direct parse
  const trimmed = raw.trim();
  try { return JSON.parse(trimmed); } catch {}

  // Balanced scan for first valid JSON object/array
  const findBalanced = (s) => {
    const openToClose = { '{': '}', '[': ']' };
    for (let i = 0; i < s.length; i++) {
      const start = s[i];
      if (!(start in openToClose)) continue;
      const end = openToClose[start];
      let depth = 0, inStr = false, esc = false;
      for (let j = i; j < s.length; j++) {
        const c = s[j];
        if (esc) { esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
        if (c === '"') inStr = !inStr;
        if (inStr) continue;
        if (c === start) depth++;
        else if (c === end) {
          depth--;
          if (depth === 0) {
            const candidate = s.slice(i, j + 1);
            try { return JSON.parse(candidate); } catch {}
          }
        }
      }
    }
    return null;
  };
  const balanced = findBalanced(raw);
  if (balanced) return balanced;

  // Fallback loose regex
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch {} }
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }
  return null;
}

export async function generateSubtasks(taskDescription, dueDate, userProfile) {
  // Deprecated in favor of schema-driven plan. Kept for compatibility if needed elsewhere.
  const prompt = `Break down this task into smaller subtasks: "${taskDescription}". Each subtask should be 15-45 minutes. Return ONLY a JSON array of objects with exact keys: title (string), estMinutes (number), difficulty (1,2,3). Consider user focus length: ${userProfile?.focusLength || 25} minutes.`;

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model: 'gemini-2.5-flash' })
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini error');

  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || '';
  const parsed = extractJson(text);
  if (Array.isArray(parsed)) return parsed;
  return [];
}

export async function generatePlan({ userInput, duration, timeWindow, dayCount, moodLabel }) {
  const jsonSchema = {
    type: 'object',
    properties: {
      plan_title: { type: 'string', minLength: 8 },
      days: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            day_title: { type: 'string', minLength: 3 },
            tasks: {
              type: 'array',
              minItems: 2,
              maxItems: 4,
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 8 },
                  time_slot: {
                    type: 'string',
                    pattern: '^(0?[1-9]|1[0-2]):[0-5][0-9]\\s?(am|pm)\\s?-\\s?(0?[1-9]|1[0-2]):[0-5][0-9]\\s?(am|pm)$'
                  },
                  duration: { type: 'integer', minimum: 10, maximum: 90 },
                  difficulty: { type: 'string', enum: ['Easy','Medium','Hard'] },
                  xp: { type: 'integer', enum: [10,20,30] },
                  steps: { type: 'array', minItems: 5, maxItems: 7, items: { type: 'string', minLength: 12 } },
                  estimation: {
                    type: 'object',
                    properties: {
                      rationale: { type: 'string', minLength: 16 },
                      base_units: { type: 'string' },
                      unit_count: { type: 'integer', minimum: 1 },
                      minutes_per_unit: { type: 'integer', minimum: 1 },
                      computed_minutes: { type: 'integer', minimum: 5 }
                    },
                    required: ['rationale','computed_minutes']
                  }
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

  const system = `You are a TruFlo productivity coach for 16–35 year olds. Craft realistic, motivating daily plans that convert intentions into measurable outputs.
Voice & Ethos
- Energetic, concise, encouraging. Gamify with XP, streaks, and milestone nudges.

Cadence & Structure
- 2–4 tasks/day. Cadence: Easy → Medium → Hard; never 3 of the same in a row.
- Always finish with a light/reflection task to avoid fatigue.
- Each task is 10–90 minutes. Insert 5–10 minute breaks after every 40–60 minutes of work. No overlaps; stay within the window.

XP System (Universal)
- Easy=10 XP (setup/review/reflection/light). Medium=20 XP (main practice/build). Hard=30 XP (deep work/problem-solving).
- Log daily XP earned.

Task Design Rules
- Concrete & Measurable: every step produces outputs (flashcards, notes, commits, sets/reps, drafts, etc.).
- Context-Specific Vocabulary: adapt steps to the domain (study=flashcards, coding=commits, fitness=sets/reps, creative=drafts/sketches).
- No filler (e.g., “study harder”).

Mood & Energy Adaptation
- If stress/low energy → start with Easy win; sprinkle micro-nudges (breath, micro-celebration, reflection).
- If high energy/flow → begin with Medium, ramp to Hard.

Realism & Flexibility
- Setup/config tasks usually need 20–30 min (not 10-min installs).
- Complex tasks should include debug/troubleshoot/revision time.
- Final day is lighter: confidence review, wrap-up, and celebration.

Engagement & Gamification
- Show daily XP totals and streak day number.
- Milestones: Day 3 → “Halfway there 🚀”; Final Day → “Boss Fight / Wrap-Up Challenge���.

Verification Policy
- Core/Deep tasks → include a verification step (test run, commit, self-quiz).
- Closure task → always verified (reflection, XP log, or artifact).`;

  const prompt = `You are planning inside the TruFlo app. Given the user input: "${userInput}", generate a focused plan for ${duration} that fits entirely within ${timeWindow}.
  Mood context: ${typeof moodLabel === 'string' && moodLabel ? moodLabel : 'neutral'} (adapt the starting task as per rules).
  Create exactly ${dayCount} day entries (days.length === ${dayCount}). Each day uses the same time window.

  Planning rules (TruFlo flow):
  1) Daily cadence: Easy → Medium → Hard (never 3 of the same in a row). End with a light/reflection task.
  2) Per day, 2–4 total tasks. Insert 5–10 minute breaks between all tasks. Each task is 10–90 minutes.
  3) Each task MUST include:
    - title (actionable and specific),
    - time_slot (12-hour "h:mm am/pm - h:mm am/pm"),
    - duration (minutes, 10–90),
    - difficulty (Easy/Medium/Hard),
    - xp (10/20/30 per mapping),
    - steps (5–7 bullet steps).
  4) Steps must be concrete, measurable, and tied to visible outputs/artifacts (flashcards, commits, sets/reps, drafts, links, etc.).
     Include micro-nudges where helpful (breath cue, mini-celebration, reflection).
  5) Estimate durations from step scope at an average-person pace; optionally include estimation rationale; add a 15–25% buffer; round to 5 minutes.
  6) Do not set duration from difficulty; choose difficulty based on cognitive load/ambiguity.
  7) Ensure scheduled minutes + breaks fit strictly within ${timeWindow}. Do not overlap.
  8) Return ONLY JSON matching the schema (no extra keys, no explanations).`;

  // Try edge route first
  let res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      system,
      model: 'gemini-2.5-flash',
      schema: JSON.stringify(jsonSchema)
    })
  });

  if (res.status === 404) {
    // Dev fallback direct proxy
    res = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [
          { text: system },
          { text: `${prompt}\n\nJSON Schema (enforce strictly):\n${JSON.stringify(jsonSchema)}` }
        ] }]
      })
    });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini error');

  const parts = data?.candidates?.[0]?.content?.parts || [];
  if (!parts.length) throw new Error('Empty response from Gemini');
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

  if (!plan || typeof plan !== 'object') throw new Error('Invalid plan format');

  function normalizePlan(raw, context) {
    const xpMap = { Easy: 10, Medium: 20, Hard: 30 };
    let obj = raw;
    if (Array.isArray(raw)) {
      obj = { plan_title: `${context.titlePrefix} Plan`, days: raw, summary: {} };
    }

    if (!obj.plan_title || typeof obj.plan_title !== 'string') {
      obj.plan_title = `${context.titlePrefix} Plan`;
    }

    // Normalize days structure
    if (!Array.isArray(obj.days)) {
      if (obj.days && typeof obj.days === 'object') {
        obj.days = [obj.days];
      } else if (Array.isArray(obj.tasks)) {
        obj.days = [{ day_title: 'Day 1', tasks: obj.tasks }];
        delete obj.tasks;
      } else {
        obj.days = [];
      }
    }

    obj.days = obj.days.map((day, idx) => {
      let d = day;
      if (Array.isArray(day)) {
        d = { day_title: `Day ${idx + 1}`, tasks: day };
      }
      if (!d.day_title) d.day_title = `Day ${idx + 1}`;
      if (!Array.isArray(d.tasks)) d.tasks = [];
      d.tasks = d.tasks.map((t) => {
        const task = { ...(t || {}) };
        if (!task.title) task.title = 'Untitled task';
        if (typeof task.duration !== 'number') {
          const maybe = parseInt(task.duration, 10);
          task.duration = Number.isFinite(maybe) ? maybe : 30;
        }
        if (!task.difficulty || !['Easy','Medium','Hard'].includes(task.difficulty)) {
          task.difficulty = 'Easy';
        }
        if (typeof task.xp !== 'number') task.xp = xpMap[task.difficulty] || 10;
        if (!Array.isArray(task.steps)) task.steps = [];
        return task;
      });
      return d;
    });

    // Compute summary if missing
    if (!obj.summary || typeof obj.summary !== 'object') obj.summary = {};
    const allTasks = obj.days.flatMap(d => d.tasks || []);
    const total_tasks = allTasks.length;
    const difficulty_breakdown = allTasks.reduce((acc, t) => {
      const k = ['Easy','Medium','Hard'].includes(t.difficulty) ? t.difficulty : 'Easy';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const total_xp = allTasks.reduce((sum, t) => sum + (typeof t.xp === 'number' ? t.xp : 0), 0);
    const total_time = allTasks.reduce((sum, t) => sum + (typeof t.duration === 'number' ? t.duration : 0), 0);
    const notes = Array.isArray(obj.summary.notes) ? obj.summary.notes : [
      'Auto-generated by TruFlo AI',
      'Includes realistic breaks between each task by difficulty, the breaks must be 5-20 mins atmost; total time may exclude breaks.'
    ];

    obj.summary = {
      total_tasks,
      difficulty_breakdown,
      total_xp,
      total_time,
      notes
    };

    return obj;
  }

  const normalized = normalizePlan(plan, { titlePrefix: userInput?.slice(0, 40) || 'Focused' });
  if (!normalized.plan_title || !Array.isArray(normalized.days) || !normalized.summary) throw new Error('Invalid plan format');
  if (Number.isFinite(dayCount) && dayCount > 0 && normalized.days.length > dayCount) {
    normalized.days = normalized.days.slice(0, dayCount);
  }
  return normalized;
}
