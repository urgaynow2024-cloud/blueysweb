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
  // Login as owner
  const login = await req('/api/auth/login', 'POST', { username: 'owner', password: 'blueyadmin' });
  const cookie = login.setCookie[0].split(';')[0];

  // Test adoptables permission enforcement
  const out = {};
  out.adoptables_get = await req('/api/adoptables', 'GET', null, cookie);
  out.adoptables_post = await req('/api/adoptables', 'POST', { title: 'Test', category: 'avatar' }, cookie);
  out.adoptables_delete = await req('/api/adoptables', 'DELETE', null, cookie);

  // Test reviews API
  out.reviews_get = await req('/api/reviews', 'GET', null, cookie);
  out.reviews_post = await req('/api/reviews', 'POST', { display_name: 'Test', review_text: 'Great!', rating: 5 }, null);

  // Test site-images
  out.site_images = await req('/api/site-images', 'GET', null, cookie);

  console.log(JSON.stringify(out, null, 2));
})();