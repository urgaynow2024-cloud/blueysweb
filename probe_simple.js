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
        resolve({ status: res.statusCode, content: Buffer.concat(chunks).toString('utf8').slice(0, 300), setCookie });
      });
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  const r = await req('/api/auth/login', 'POST', { username: 'owner', password: 'blueyadmin' });
  console.log('OWNER login:', r.status, r.content);
})();