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
        resolve({ status: res.statusCode, content: Buffer.concat(chunks).toString('utf8').slice(0, 800), setCookie });
      });
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  // Login as owner
  const login = await req('/api/auth/login', 'POST', { username: 'owner', password: 'blueyadmin' });
  const cookie = login.setCookie[0].split(';')[0];

  // Test moderator page
  const modPage = await req('/moderator', 'GET', null, cookie);
  console.log('MODERATOR PAGE:', modPage.status, modPage.content.slice(0, 300));

  // Test admin page
  const adminPage = await req('/admin', 'GET', null, cookie);
  console.log('ADMIN PAGE:', adminPage.status, adminPage.content.slice(0, 300));

  // Test reviews API
  const reviews = await req('/api/reviews', 'GET', null, cookie);
  console.log('REVIEWS API:', reviews.status, reviews.content.slice(0, 300));
})();