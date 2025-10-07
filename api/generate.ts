const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function readBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return req.body ? JSON.parse(req.body) : {};
  }

  if (!req.body) {
    return new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (err) {
          reject(err);
        }
      });
      req.on("error", reject);
    });
  }

  return req.body;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", CORS_HEADERS["Access-Control-Allow-Origin"]);
  res.setHeader("Access-Control-Allow-Methods", CORS_HEADERS["Access-Control-Allow-Methods"]);
  res.setHeader("Access-Control-Allow-Headers", CORS_HEADERS["Access-Control-Allow-Headers"]);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: { message: "Missing GEMINI_API_KEY" } });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    res.status(400).json({ error: { message: "Invalid JSON body" } });
    return;
  }

  const { prompt, model = "gemini-2.5-flash", system, schema, generationConfig } = body || {};

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: { message: "prompt (string) is required" } });
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const parts = [];
  if (system && typeof system === "string") {
    parts.push({ text: system.trim() });
  }

  const promptWithSchema = schema
    ? `${prompt}\n\nJSON Schema (enforce strictly):\n${typeof schema === "string" ? schema : JSON.stringify(schema)}`
    : prompt;

  parts.push({ text: promptWithSchema });

  const payload = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
  };

  try {
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      res.status(geminiRes.status).json({ error: data?.error || data });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err?.message || "Gemini request failed" } });
  }
}
