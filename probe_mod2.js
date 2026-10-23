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
  // Wait for rate limit to clear, then try owner login
  await new Promise(r => setTimeout(r, 70000));
  const login = await req('/api/auth/login', 'POST', { username: 'owner', password: 'blueyadmin' });
  console.log('OWNER login:', login.status, login.content.slice(0, 200));
  if (login.status !== 200) return;
  const cookie = login.setCookie[0].split(';')[0];
  const mods = await req('/api/moderators', 'GET', null, cookie);
  console.log('MODERATORS:', mods.status, mods.content.slice(0, 800));
})();