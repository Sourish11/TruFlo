export const runtime = "edge";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS });
}

export async function POST(req: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { prompt, model = "gemini-1.5-flash", system, schema, generationConfig } = body || {};

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt (string) is required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const parts: Array<{ text: string }> = [];
    if (system && typeof system === "string") {
      parts.push({ text: system.trim() });
    }

    const promptWithSchema = schema ? `${prompt}\n\nJSON Schema (enforce strictly):\n${typeof schema === 'string' ? schema : JSON.stringify(schema)}` : prompt;
    parts.push({ text: promptWithSchema });

    const payload: any = {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        ...(generationConfig || {}),
      },
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(
        JSON.stringify({ error: data?.error || data }),
        { status: geminiRes.status, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Gemini request failed" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
}
