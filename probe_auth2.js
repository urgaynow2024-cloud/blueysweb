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
        resolve({ status: res.statusCode, content: Buffer.concat(chunks).toString('utf8').slice(0, 500), setCookie });
      });
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  // Test moderator login
  const mod = await req('/api/auth/login', 'POST', { username: 'Hellcat', password: 'definitelywrong' });
  console.log('MOD wrong pw:', mod.status, mod.content);

  // Test empty password
  const mod2 = await req('/api/auth/login', 'POST', { username: 'Hellcat', password: '' });
  console.log('MOD empty pw:', mod2.status, mod2.content);

  // Test non-existent user
  const mod3 = await req('/api/auth/login', 'POST', { username: 'nonexistent', password: 'test' });
  console.log('MOD noexist:', mod3.status, mod3.content);

  // Test /api/auth/me with no cookie
  const me = await req('/api/auth/me');
  console.log('ME no cookie:', me.status, me.content);

  // Test /api/auth/me with bad cookie
  const me2 = await req('/api/auth/me', 'GET', null, 'bc_session=invalid.token.here');
  console.log('ME bad cookie:', me2.status, me2.content);
})();