// End-to-end smoke test for the static site (docs/). Runs in headless Chromium against a tiny built-in web server.
//
//   npm i && npx playwright install chromium && npm test
//
// It checks: the app boots with no errors and no third-party requests, every lab/CTF can be solved, the capstone exam
// gates the certificate, the Hunt Tracker works, EN/GR switching, the waitlist form (network is mocked, nothing is
// ever sent to Supabase), mobile layout, the privacy page, and that no secret key ended up in the published files.

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

let passed = 0, failed = 0;
const ok = (cond, name, detail) => {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? '  ->  ' + JSON.stringify(detail) : '')); }
};
const section = t => console.log('\n' + t);

const browser = await chromium.launch();

/** a fresh page with error + request tracking */
async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.width || 1150, height: opts.height || 900 }, colorScheme: opts.scheme || 'dark' });
  const page = await ctx.newPage();
  const t = { errors: [], hosts: new Set(), bad: [] };
  page.on('pageerror', e => t.errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) t.errors.push('console: ' + m.text()); });
  page.on('request', r => { try { t.hosts.add(new URL(r.url()).host); } catch { /* data: urls etc. */ } });
  // the XSS lab deliberately loads <img src=x>, which 404s on purpose
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/x')) t.bad.push(r.status() + ' ' + r.url()); });
  await page.goto(base + (opts.path || 'index.html'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(opts.settle ?? 350);
  return { ctx, page, t };
}
const ev = (page, fn, arg) => page.evaluate(fn, arg);
const wait = (page, ms = 120) => page.waitForTimeout(ms);

// ---------------------------------------------------------------- 1. boot
section('1. boot');
{
  const { ctx, page, t } = await open();
  await wait(page, 300);
  const info = await ev(page, () => ({ modules: COURSE.length, lessons: ALL.length, labs: labTotal(), lang: document.documentElement.lang, fonts: [...document.fonts].filter(f => f.status === 'loaded').length, title: document.title }));
  ok(t.errors.length === 0, 'no page or console errors', t.errors);
  ok(t.bad.length === 0, 'no failed requests', t.bad);
  ok([...t.hosts].every(h => h === new URL(base).host), 'no third-party requests (everything is served from the site itself)', [...t.hosts]);
  ok(info.modules >= 11 && info.lessons >= 55 && info.labs >= 20, 'course content is present', info);
  ok(info.fonts > 0, 'self-hosted fonts load', info.fonts);
  ok(info.lang === 'en', 'html lang is en');
  ok(/First Bounty/.test(info.title), 'page title', info.title);
  await ctx.close();
}

// ---------------------------------------------------------------- 2. labs and CTFs
section('2. labs & CTFs');
{
  const { ctx, page, t } = await open();
  const go = async id => { await ev(page, i => window.openLesson(i), id); await wait(page, 150); };
  const flagMsg = () => ev(page, () => document.querySelector('.flagmsg').textContent);

  await go('4.3');
  await ev(page, () => { const i = document.querySelector('.xin'); i.value = '<img src=x onerror="parent.postMessage(\'xss-fired\',\'*\')">'; document.querySelector('.run').click(); });
  await wait(page, 500);
  ok(await ev(page, () => !!document.querySelector('.flag-reveal')), 'XSS lab (4.3)');

  await go('3.2');
  ok(await ev(page, () => { const i = document.querySelector('.lab input[type=number]'); i.value = 1000; document.querySelector('.fetch').click(); return !!document.querySelector('.flag-reveal'); }), 'IDOR lab (3.2)');

  await go('5.2');
  ok(await ev(page, () => { document.querySelector('.u').value = "admin'-- "; document.querySelector('.login').click(); return document.querySelector('.out1').textContent.includes('FLAG'); }), 'SQLi login bypass (5.2)');
  ok(await ev(page, () => { document.querySelector('.s').value = "' UNION SELECT username,password FROM secrets-- "; document.querySelector('.search').click(); return document.querySelector('.out2').textContent.includes('FLAG'); }), 'SQLi UNION (5.2)');

  await go('6.2');
  ok(await ev(page, () => { document.querySelector('.url').value = 'http://169.254.169.254/latest/meta-data/'; document.querySelector('.fetch').click(); return !!document.querySelector('.flag-reveal'); }), 'SSRF cloud metadata (6.2)');
  ok(await ev(page, () => { document.querySelector('.url').value = 'http://2130706433:8080/admin'; document.querySelector('.fetch').click(); return document.querySelector('.lab-out').textContent.includes('FLAG'); }), 'SSRF filter bypass (6.2)');
  ok(await ev(page, () => { document.querySelector('.url').value = 'http://localhost/admin'; document.querySelector('.fetch').click(); return document.querySelector('.lab-out').textContent.includes('Blocked'); }), 'SSRF obvious payload is blocked (6.2)');

  const submitFlag = async (id, value) => { await go(id); await ev(page, v => { document.querySelector('.flaginput input').value = v; document.querySelector('.flaginput button').click(); }, value); return flagMsg(); };
  const b64u = s => Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  ok(/Correct/.test(await submitFlag('7.3', b64u('{"alg":"none","typ":"JWT"}') + '.' + b64u('{"uid":1024,"role":"admin"}') + '.')), 'JWT alg:none (7.3)');
  ok(/Correct/.test(await submitFlag('3.3', Buffer.from('{"uid":1024,"role":"admin"}').toString('base64'))), 'forged role cookie (3.3)');
  ok(/Correct/.test(await submitFlag('2.3', 'FLAG{js_recon_never_skip_the_bundle}')), 'JS recon CTF (2.3)');
  ok(/Correct/.test(await submitFlag('8.2', 'FLAG{exposed_env_files_are_free_money}')), 'exposed .env CTF (8.2)');

  await go('1.3');
  ok(await ev(page, () => { const ta = document.querySelector('.lab textarea'); ta.value = ta.value.replace('"price":199', '"price":0').replace('"role":"user"', '"role":"admin"'); document.querySelector('.send').click(); return !!document.querySelector('.flag-reveal'); }), 'intercept & tamper (1.3)');

  await go('0.5');
  ok(await ev(page, () => { document.querySelectorAll('.quiz').forEach(q => q.querySelectorAll('.opt')[1].click()); return document.querySelectorAll('.quiz .opt.correct').length === 3; }), 'quiz marks correct answers (0.5)');

  ok(t.errors.length === 0, 'no errors while solving labs', t.errors);
  await ctx.close();
}

// ---------------------------------------------------------------- 3. capstone gates the certificate
section('3. capstone & certificate');
{
  const { ctx, page, t } = await open();
  const submit = () => ev(page, () => [...document.querySelectorAll('.btn')].find(b => /Submit|Υποβ/.test(b.textContent)).click());
  const answerAll = async good => {
    await ev(page, () => { window.showTool('capstone'); document.querySelector('.btn').click(); });
    await wait(page, 80);
    await ev(page, g => {
      const correct = new Set(CAPSTONE.map(q => q.opts[q.a]));
      document.querySelectorAll('.quiz').forEach(qz => {
        const opts = [...qz.querySelectorAll('.opt')];
        (opts.find(o => correct.has(o.textContent) === g) || opts[0]).click();
      });
    }, good);
    await submit(); await wait(page, 100);
  };
  const gated = await ev(page, () => { window.showTool('certificate'); return { seal: document.querySelector('.cert-seal').textContent, gate: !!document.querySelector('.note .nt') }; });
  ok(gated.gate && !/CERTIFIED/i.test(gated.seal), 'certificate is gated before the exam', gated);
  await answerAll(false);
  ok(await ev(page, () => !!document.querySelector('.cap-review') && !capPassed()), 'wrong answers fail the exam and show a review');
  await ev(page, () => localStorage.removeItem('firstbounty.capstone'));
  await answerAll(true);
  ok(await ev(page, () => capPassed()), 'correct answers pass the exam');
  ok(await ev(page, () => { window.showTool('certificate'); return /CERTIFIED/i.test(document.querySelector('.cert-seal').textContent); }), 'certificate is verified after passing');
  ok(await ev(page, () => shareText().includes('Certified')), 'share text mentions the certification');
  ok(t.errors.length === 0, 'no errors', t.errors);
  await ctx.close();
}

// ---------------------------------------------------------------- 4. hunt tracker
section('4. hunt tracker');
{
  const { ctx, page, t } = await open();
  const rows = () => ev(page, () => document.querySelectorAll('.ht-report').length);
  const btn = re => ev(page, s => [...document.querySelectorAll('.btn')].find(b => new RegExp(s, 'i').test(b.textContent)).click(), re);
  await ev(page, () => window.showTool('tracker'));
  ok(await ev(page, () => document.querySelectorAll('.ht-kpi').length === 6 && !!document.querySelector('.ht-empty')), 'empty state with 6 KPIs');
  await btn('example'); await wait(page, 60);
  ok(await rows() === 5, 'example data loads');
  await btn('Add report'); await wait(page, 60);
  await ev(page, () => {
    const f = document.querySelector('.ht-form');
    f.querySelector('input').value = 'Test SSRF to metadata';
    [...f.querySelectorAll('select')].find(s => [...s.options].some(o => o.value === 'Paid')).value = 'Paid';
    [...f.querySelectorAll('input')].find(i => i.type === 'number').value = '500';
    [...f.querySelectorAll('.btn')].find(b => /Save/.test(b.textContent)).click();
  });
  await wait(page, 80);
  ok(await rows() === 6, 'a report can be added');
  await ev(page, () => document.querySelector('.htr-btn').click()); await wait(page, 60);
  await ev(page, () => { const i = document.querySelector('.ht-form input'); i.value += ' (edited)'; [...document.querySelectorAll('.ht-form .btn')].find(b => /Save/.test(b.textContent)).click(); });
  await wait(page, 80);
  ok(await ev(page, () => document.querySelector('.htr-title').textContent.includes('edited')), 'a report can be edited');
  await ev(page, () => { const d = document.querySelector('.htr-btn.del'); d.click(); });
  ok(await rows() === 6, 'delete needs a second click');
  await ev(page, () => document.querySelector('.htr-btn.del').click()); await wait(page, 80);
  ok(await rows() === 5, 'second click deletes');
  await ev(page, () => { document.querySelector('.ht-backup summary').click(); document.querySelector('.ht-import').value = '{"reports":[{"id":"x1","title":"[imported] one","program":"P","platform":"Other","severity":"Low","status":"Submitted","bounty":0,"date":"2026-10-01","notes":""}]}'; });
  // the button re-labels itself after the first click ("Confirm — this overwrites everything"), so keep a handle on it
  await ev(page, () => { const imp = [...document.querySelectorAll('.btn')].find(b => /Import/.test(b.textContent)); imp.click(); imp.click(); }); await wait(page, 80);
  ok(await rows() === 1, 'import replaces the data after confirmation');
  ok(t.errors.length === 0, 'no errors', t.errors);
  await ctx.close();
}

// ---------------------------------------------------------------- 5. EN / GR
section('5. language switch');
{
  const { ctx, page, t } = await open();
  const before = await ev(page, () => document.querySelector('.hero h2').textContent);
  await ev(page, () => document.querySelector('#langToggle').click()); await wait(page, 100);
  const gr = await ev(page, () => ({ h: document.querySelector('.hero h2').textContent, btn: document.querySelector('#langToggle').textContent, lang: document.documentElement.lang, saved: localStorage.getItem('firstbounty.lang') }));
  ok(gr.h !== before && gr.btn === 'GR' && gr.lang === 'gr' && gr.saved === 'gr', 'switches to Greek and remembers it', gr);
  await page.reload({ waitUntil: 'domcontentloaded' }); await wait(page, 300);
  ok(await ev(page, () => document.documentElement.lang === 'gr'), 'Greek survives a reload');
  await ev(page, () => document.querySelector('#langToggle').click()); await wait(page, 100);
  ok(await ev(page, () => document.documentElement.lang === 'en'), 'switches back to English');
  ok(t.errors.length === 0, 'no errors', t.errors);
  await ctx.close();
}

// ---------------------------------------------------------------- 6. waitlist (network mocked)
section('6. waitlist form');
async function waitlistPage(status) {
  const h = await open({ settle: 0 });
  h.calls = [];
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
  await h.page.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => {
    const r = route.request();
    if (r.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    h.calls.push({ method: r.method(), url: r.url(), headers: r.headers(), body: r.postData() });
    if (status === 'abort') return route.abort('failed');
    return route.fulfill({ status, headers: cors, body: status === 201 ? '' : '{"code":"x"}' });
  });
  await h.page.reload({ waitUntil: 'domcontentloaded' }); await wait(h.page, 350);
  return h;
}
const wl = page => ev(page, () => ({ form: !!document.querySelector('#wlForm'), ok: (document.querySelector('.wl-msg.ok') || {}).textContent || null, msg: (document.querySelector('#wlMsg') || {}).textContent || '', disabled: (document.querySelector('#wlForm button[type=submit]') || {}).disabled }));
const send = async (page, email, consent = true) => { await page.fill('#wlEmail', email); await page.setChecked('#wlConsent', consent); await page.click('#wlForm button[type=submit]'); await wait(page, 350); };
{
  const { ctx, page, t, calls } = await waitlistPage(201);
  const cfg = await ev(page, () => window.FB_CONFIG.supabase);
  ok(cfg && /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(cfg.url) && /^sb_publishable_/.test(cfg.key), 'config has a Supabase URL and a publishable key', cfg && { url: cfg.url, keyPrefix: cfg.key && cfg.key.slice(0, 15) });
  ok((await wl(page)).form, 'form is shown');
  await page.click('#wlForm button[type=submit]'); ok(/doesn't look right/.test((await wl(page)).msg), 'empty email is rejected on the client');
  await send(page, 'not-an-email'); ok(/doesn't look right/.test((await wl(page)).msg), 'malformed email is rejected on the client');
  await send(page, 'someone@example.com', false); ok(/tick the box/.test((await wl(page)).msg), 'missing consent is rejected on the client');
  ok(calls.length === 0, 'nothing is sent before email + consent are valid', calls.length);
  await send(page, '  Some.One@Example.COM ');
  const c = calls[0] || {};
  const body = c.body ? JSON.parse(c.body) : {};
  ok(calls.length === 1 && c.method === 'POST' && c.url === cfg.url + '/rest/v1/waitlist', 'one POST to /rest/v1/waitlist', calls.map(x => x.method + ' ' + x.url));
  ok(c.headers && c.headers.apikey === cfg.key && c.headers.prefer === 'return=minimal' && !('authorization' in c.headers), 'publishable key only, return=minimal', c.headers);
  ok(body.email === 'some.one@example.com' && body.lang === 'en' && body.consent === true && body.consent_version === cfg.consentVersion && body.source === 'site' && Object.keys(body).length === 5, 'request body is exactly what the table expects', body);
  ok((await wl(page)).ok && !(await wl(page)).form, 'success message replaces the form');
  await page.reload({ waitUntil: 'domcontentloaded' }); await wait(page, 350);
  ok((await wl(page)).ok && !(await wl(page)).form, 'success state persists after a reload');
  ok(t.errors.length === 0, 'no errors', t.errors);
  await ctx.close();
}
{
  const { ctx, page, calls } = await waitlistPage(201);
  await ev(page, () => { document.querySelector('#wlHp').value = 'spam'; });
  await send(page, 'bot@example.com');
  ok(calls.length === 0 && (await wl(page)).ok, 'honeypot: bots get a fake success and nothing is sent');
  await ctx.close();
}
{
  const { ctx, page, calls } = await waitlistPage(409);
  await send(page, 'already@example.com');
  ok(calls.length === 1 && (await wl(page)).ok, 'duplicate signup looks like success (does not reveal who is on the list)');
  await ctx.close();
}
{
  const { ctx, page } = await waitlistPage(400);
  await send(page, 'rejected@example.com');
  const s = await wl(page);
  ok(s.form && !s.disabled && /doesn't look right/.test(s.msg), 'server-side rejection shows an error and lets you retry', s);
  await ctx.close();
}
{
  const { ctx, page } = await waitlistPage('abort');
  await send(page, 'offline@example.com');
  const s = await wl(page);
  ok(s.form && !s.disabled && /Couldn't reach/.test(s.msg) && (await ev(page, () => localStorage.getItem('firstbounty.wl'))) === null, 'network failure shows an error, allows a retry, stores nothing', s);
  await ctx.close();
}
{
  const { ctx, page, calls } = await waitlistPage(201);
  await ev(page, () => document.querySelector('#langToggle').click()); await wait(page, 150);
  await send(page, 'gr@example.com');
  ok(calls.length === 1 && JSON.parse(calls[0].body).lang === 'gr', 'Greek UI sends lang "gr"');
  await ctx.close();
}

// ---------------------------------------------------------------- 7. mobile layout
section('7. mobile layout');
for (const w of [320, 360, 390]) {
  const { ctx, page } = await open({ width: w, height: 780 });
  const views = [() => window.openLesson('0.2'), () => window.openLesson('3.2'), () => window.showTool('home'), () => window.showTool('arsenal'), () => window.showTool('manual'), () => window.showTool('report'), () => window.showTool('tracker'), () => window.showTool('capstone'), () => window.showTool('certificate')];
  let overflow = 0;
  for (const v of views) { await ev(page, v); await wait(page, 100); overflow = Math.max(overflow, await ev(page, () => document.documentElement.scrollWidth - innerWidth)); }
  ok(overflow <= 0, `no horizontal scroll at ${w}px on any screen`, overflow);
  const hdr = await ev(page, () => { const r = [...document.querySelectorAll('header .menu-toggle, header .brand, header .hdr-right')].map(e => e.getBoundingClientRect()).filter(x => x.width > 0); return r.every((x, i) => x.right <= innerWidth + .5 && (i === r.length - 1 || x.right <= r[i + 1].left + .5)); });
  ok(hdr, `header does not overlap at ${w}px`);
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 390, height: 780 });
  const vis = () => ev(page, () => getComputedStyle(document.querySelector('#sidebar')).visibility);
  ok(await vis() === 'hidden', 'closed drawer is hidden (and not focusable)');
  await page.click('#menuToggle'); await wait(page, 400);
  ok(await vis() === 'visible', 'menu button opens the drawer');
  await page.click('#overlay', { position: { x: 384, y: 400 } }); await wait(page, 400);
  ok(await vis() === 'hidden', 'tapping outside closes it');
  await ctx.close();
}

// ---------------------------------------------------------------- 8. privacy page
section('8. privacy page');
{
  const { ctx, page, t } = await open({ path: 'privacy.html' });
  const snap = () => ev(page, () => ({ h1: [...document.querySelectorAll('h1')].filter(h => h.offsetParent).map(h => h.textContent), lang: document.documentElement.lang, name: document.querySelector('[data-fill=name]').textContent, links: document.querySelector('[data-fill=contact]').querySelectorAll('a').length, mail: [...document.querySelector('[data-fill=contact]').querySelectorAll('a[href^="mailto:"]')].map(a => a.getAttribute('href')) }));
  const en = await snap();
  ok(en.h1.length === 1 && en.h1[0] === 'Privacy notice' && en.lang === 'en' && en.name.length > 0 && en.links > 0, 'English version, controller name and contact links are filled in', en);
  // the contact address comes from config.js; a notice that collects emails must say how to reach the controller
  const cfgEmail = (fs.readFileSync(path.join(root, 'assets', 'config.js'), 'utf8').match(/contactEmail\s*:\s*"([^"]*)"/) || [])[1] || '';
  ok(cfgEmail.length > 3 && cfgEmail.includes('@'), 'a contact email is set in config.js (the privacy notice needs one while the waitlist collects emails)', cfgEmail);
  ok(en.mail.length === 1 && en.mail[0] === 'mailto:' + cfgEmail, 'the privacy page links exactly that address', en.mail);
  await page.click('.langswitch button[data-set=gr]');
  const gr = await snap();
  ok(gr.h1.length === 1 && gr.h1[0] === 'Δήλωση απορρήτου' && gr.lang === 'el' && gr.mail.length === 1, 'Greek version (same contact link)', gr);
  ok(t.errors.length === 0 && t.bad.length === 0, 'no errors', [...t.errors, ...t.bad]);
  await ctx.close();
}

// ---------------------------------------------------------------- 9. published files: links + secrets
section('9. published files');
{
  const files = [];
  (function walk(d) { for (const n of fs.readdirSync(d)) { const f = path.join(d, n); fs.statSync(f).isDirectory() ? walk(f) : files.push(f); } })(root);
  const text = files.filter(f => /\.(html|js|css|txt|svg)$/.test(f));
  const missing = [];
  for (const f of text.filter(f => /\.html$/.test(f))) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/(?:href|src)="([^"#?]+)"/g)) {
      const u = m[1];
      if (/^(https?:|mailto:|data:|javascript:)/.test(u)) continue;
      if (!fs.existsSync(path.resolve(path.dirname(f), u))) missing.push(path.relative(root, f) + ' -> ' + u);
    }
  }
  ok(missing.length === 0, 'every relative link/script/stylesheet in the HTML points to a file that exists', missing);
  const leaks = [];
  for (const f of text) {
    const src = fs.readFileSync(f, 'utf8');
    if (/sb_secret_|service_role|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/.test(src.replace(/"role"\s*:\s*"anon"/g, ''))) leaks.push(path.relative(root, f) + ': secret-looking string');
    for (const m of src.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.([A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}/g)) {
      try { const role = JSON.parse(Buffer.from(m[1], 'base64url').toString()).role; if (role && role !== 'anon') leaks.push(path.relative(root, f) + ': JWT with role ' + role); } catch { /* not a JWT */ }
    }
  }
  ok(leaks.length === 0, 'no secret / service-role key in the published files', leaks);
  // Personal data check: the only email address anywhere is the configured contact (plus obviously fake example addresses),
  // and no phone number in the pages people read.
  const cfgMail = (fs.readFileSync(path.join(root, 'assets', 'config.js'), 'utf8').match(/contactEmail\s*:\s*"([^"]*)"/) || [])[1] || '';
  const strayMail = [], phones = [];
  for (const f of text) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g)) {
      const e = m[0];
      // evil.com and x.com: fictional addresses used in lessons and labs (e.g. the CSRF email-change lab)
      if (e === cfgMail || /@(example\.(com|org|net|invalid)|[a-z0-9.-]*\.invalid|test\.org|acme\.com|evil\.com|x\.com)$/i.test(e)) continue;
      strayMail.push(path.relative(root, f) + ': ' + e);
    }
    if (/\.html$|config\.js$/.test(f)) for (const m of src.matchAll(/(?:\+30|0030)[\s-]?\d[\d\s-]{8,12}\d|\b69\d{8}\b/g)) phones.push(path.relative(root, f) + ': ' + m[0]);
  }
  ok(strayMail.length === 0, 'no email address in the published files other than the configured contact (and fake examples)', strayMail);
  ok(phones.length === 0, 'no phone number in the published pages', phones);
}

await browser.close();
server.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
