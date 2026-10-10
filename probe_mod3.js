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
  const mod = await req('/api/auth/login', 'POST', { username: 'Hellcat', password: 'definitelywrong' });
  console.log('MOD wrong pw:', mod.status, mod.content);
  const mod2 = await req('/api/auth/login', 'POST', { username: 'Hellcat', password: '' });
  console.log('MOD empty pw:', mod2.status, mod2.content);
  const mod3 = await req('/api/auth/login', 'POST', { username: 'nonexistent', password: 'test' });
  console.log('MOD noexist:', mod3.status, mod3.content);
})();