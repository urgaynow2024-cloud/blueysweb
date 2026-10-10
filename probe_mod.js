const http = require('http');

function req(path, method = 'GET', body = null, cookie = '') {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json', 'User-Agent': 'kilo-probe/1.0' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (cookie) headers['Cookie'] = cookie;
    const opts = { hostname: 'localhost', port: 3000, path, method, headers };
    const r = http.request(opts, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'] || [];
        resolve({ status: res.statusCode, content: Buffer.concat(chunks).toString('utf8'), setCookie });
      });
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  // Test moderator login
  const mod = await req('/api/auth/login', 'POST', { username: 'Hellcat', password: 'blueyadmin' });
  console.log('MOD login (blueyadmin):', mod.status, mod.content.slice(0, 200));

  // Try common passwords
  for (const pw of ['password', 'Password123', 'moderator', '123456', 'admin', 'hellcat', 'Blueyadmin', 'bluey', 'changeme']) {
    const r = await req('/api/auth/login', 'POST', { username: 'Hellcat', password: pw });
    if (r.status === 200) { console.log(`MOD login SUCCESS with password="${pw}":`, r.content.slice(0, 200)); break; }
  }

  // Check /api/moderators endpoint (owner-only)
  const login = await req('/api/auth/login', 'POST', { username: 'owner', password: 'blueyadmin' });
  const cookie = login.setCookie[0].split(';')[0];
  const mods = await req('/api/moderators', 'GET', null, cookie);
  console.log('MODERATORS (owner):', mods.status, mods.content.slice(0, 500));
})();