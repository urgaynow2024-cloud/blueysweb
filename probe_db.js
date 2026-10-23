const https = require('https');
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cGhubGNxcWRob2F2dHV6Ym50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzcwMTUzNywiZXhwIjoyMDk5Mjc3NTM3fQ.oyZVyqEEpGcH0nw6lfC6sC4YKroo38xPaq_yGQTvdP0';
const BASE = 'https://qxphnlcqqdhoavtuzbnt.supabase.co/rest/v1';

function get(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE}${path}?limit=5`;
    const req = https.request(url, {
      method: 'GET',
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  for (const table of ['moderators', 'reviews', 'adoptables', 'site_config', 'site_images']) {
    const r = await get('/' + table);
    console.log(`\n=== ${table} (HTTP ${r.status}) ===`);
    console.log(r.data.slice(0, 1200));
  }
  // Get one review to see columns
  const r = await get('/reviews');
  try {
    const parsed = JSON.parse(r.data);
    if (parsed[0]) console.log('\nREVIEWS COLUMNS:', Object.keys(parsed[0]));
  } catch (e) { console.log('\nReviews parse error:', e.message); }
})();