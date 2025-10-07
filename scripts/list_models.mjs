const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}
const doList = async (ver) => {
  const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  console.log('version', ver, 'status', res.status);
  const data = await res.json();
  if (!res.ok) {
    console.log('error', data);
    return;
  }
  console.log('count', (data.models||[]).length);
  console.log('sample', (data.models||[]).slice(0,10).map(m=>m.name));
}
await doList('v1');
await doList('v1beta');
