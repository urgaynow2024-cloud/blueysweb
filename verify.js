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
        resolve({ status: res.statusCode, content: Buffer.concat(chunks).toString('utf8').slice(0, 400), setCookie });
      });
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  const out = {};
  // Auth probes
  out.login_valid = await req('/api/auth/login', 'POST', { username: 'owner', password: 'blueyadmin' });
  out.login_wrong = await req('/api/auth/login', 'POST', { username: 'owner', password: 'wrong' });
  out.login_noexist = await req('/api/auth/login', 'POST', { username: 'nobody', password: 'test' });
  out.login_empty = await req('/api/auth/login', 'POST', { username: '', password: '' });
  out.me_no_cookie = await req('/api/auth/me');
  out.me_bad_cookie = await req('/api/auth/me', 'GET', null, 'bc_session=bad.token.here');

  if (out.login_valid.status === 200) {
    const cookie = out.login_valid.setCookie[0].split(';')[0];
    out.me_with_cookie = await req('/api/auth/me', 'GET', null, cookie);
    out.admin_page = await req('/admin', 'GET', null, cookie);
    out.mod_page = await req('/moderator', 'GET', null, cookie);
    out.reviews_api = await req('/api/reviews', 'GET', null, cookie);
    out.moderators_api = await req('/api/moderators', 'GET', null, cookie);
  }

  console.log(JSON.stringify(out, null, 2));
})();