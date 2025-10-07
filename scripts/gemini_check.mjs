const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Missing GEMINI_API_KEY env');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;

const payload = {
  contents: [
    {
      role: 'user',
      parts: [{ text: 'Return a JSON object with key message set to Hello.' }]
    }
  ]
};

(async () => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('status', res.status);
  const data = await res.json();
  console.log('keys', Object.keys(data ?? {}));
  if (!res.ok) {
    console.log('error', data);
  } else {
    console.log('response', JSON.stringify(data));
  }
})();
