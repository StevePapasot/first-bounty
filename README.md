# First Bounty

A free, hands-on bug bounty course that runs entirely in the browser: theory lessons, in-browser labs and CTFs, a Field Manual, an Arsenal of payloads and commands, a Report Builder, a Hunt Tracker, a capstone exam and a certificate. The interface is English with a Greek (GR) switch.

> Every lab is a local simulation. No real system is ever touched, and the course teaches you to test only what you are authorised to test.

Built in public by [Stavros Papasotiropoulos](https://github.com/StevePapasot).

## What is in the repo

```
docs/                    the published site (GitHub Pages serves /docs; Cloudflare/Netlify: set "publish directory" to docs)
  index.html             the app shell
  privacy.html           privacy notice (EN + GR)
  assets/
    config.js            ← the one file you edit: Supabase URL/key, links, instructor bio, contact email
    app.js, app.css      the course app (lessons, labs, tools)
    fonts.css, fonts/    IBM Plex, self-hosted (SIL OFL 1.1) so visitors never contact Google
    page.css             styles for plain pages such as privacy.html
    og.png               social-share preview image
supabase/waitlist.sql    the database schema behind the waitlist (already applied)
tests/smoke.mjs          end-to-end smoke test (Playwright)
.github/workflows/       daily keep-alive for the free Supabase project
```

There is no build step: what is in `docs/` is what gets published.

## Run it locally

```bash
npm start            # serves docs/ on http://localhost:8080
```

or any static server, e.g. `python3 -m http.server 8080 -d docs`.

## Configure

Everything site-specific lives in [`docs/assets/config.js`](docs/assets/config.js). It ships to every visitor's browser, so **never put a secret in it**.

| Setting | What it does |
| --- | --- |
| `supabase.url`, `supabase.key` | Where the waitlist form sends signups. Only the **publishable** key belongs here. |
| `supabase.consentVersion` | Version label stored with every signup. Bump it when you change the consent wording (`wl.consent` in `app.js`) or `privacy.html`. |
| `waitlistUrl` | Fallback external form link, used only if `supabase` is removed. |
| `communityUrl` | Optional second button (e.g. a Discord invite). |
| `contactEmail` | Shown on the privacy page as the way to reach you about your data. Use a project address, not your personal one. |
| `instructor` | Name, tagline, credentials, bio and public links for the About block. |

## The waitlist (Supabase)

The form on the home page `POST`s to the Supabase REST API with the publishable key. Row-level security allows exactly one thing for the public: inserting a row that has `consent = true`. Nobody can read, change or delete rows through the API, and the table also rejects malformed or duplicate emails. See [`supabase/waitlist.sql`](supabase/waitlist.sql).

- **See signups:** Supabase dashboard → project `first-bounty` → Table Editor → `waitlist` (export as CSV from there).
- **Erase someone on request:** SQL editor → `delete from public.waitlist where email = 'person@example.com';`
- **A duplicate signup looks like a success** on purpose, so the form cannot be used to find out who is on the list.
- **Free-plan projects are paused after about a week without activity.** `.github/workflows/keepalive.yml` makes one trivial call per day to prevent that. If you stop using GitHub Actions, keep the project awake another way (any scheduler that can send an HTTP request with the `apikey` header to `rpc/keepalive`) or upgrade the plan.
- **Spam:** if junk signups ever appear, add a CAPTCHA (e.g. Cloudflare Turnstile) with a small Edge Function in front of the insert.
- **Before you email the list,** use a mailer that does double opt-in and unsubscribe links, and update the privacy notice to name it.

## Deploy

**GitHub Pages:** the repository must be public on a free account. Settings → Pages → Build and deployment → *Deploy from a branch* → branch `main`, folder `/docs`.

**Cloudflare Pages (works with a private repo):** create a project from the repo, framework preset *None*, build command empty, output directory `docs`.

**Custom domain:** add it in the host's settings (GitHub Pages also wants a `docs/CNAME` file containing the domain). Then update the absolute URLs in the `<head>` of `docs/index.html` (`og:url`, `og:image`, `twitter:image`).

**If you change hosting provider,** update the "GitHub Pages" sentence in `docs/privacy.html`.

## Tests

```bash
npm i
npx playwright install chromium
npm test
```

The suite starts its own web server, drives the site in headless Chromium and checks: no errors and no third-party requests, every lab and CTF is solvable, the capstone gates the certificate, the Hunt Tracker, EN/GR switching, the waitlist form (the network is mocked, nothing reaches Supabase), mobile layout, the privacy page, and that no secret key is in the published files.

## Honest limits

- Progress, streak, tracker entries and the capstone result live in the visitor's `localStorage`. That keeps the site tracking-free, but it also means the certificate is a self-check badge, not proof: anyone can edit their own browser storage. Verifiable certificates would need accounts and server-side scoring.
- Lesson bodies, labs, Arsenal and Field Manual are in English; the Greek switch translates the interface.

## Credits and licence

Fonts: [IBM Plex](https://github.com/IBM/plex) by IBM, SIL Open Font License 1.1 (licence files are in `docs/assets/fonts/`).

No licence has been chosen for the course content and code yet, so by default all rights are reserved.
