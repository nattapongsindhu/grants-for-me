# Architecture Review: grants-for-me

## Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS — deployed on Vercel
- **Data:** Static `public/data/grants.json` — read at build time via `fs.readFileSync`
- **Pipeline:** Python (BeautifulSoup) scraper → GitHub Actions cron → commit updated JSON → Vercel rebuilds

---

## Pros

**Zero infrastructure cost.** No database server, no API backend, no auth system. Vercel free tier handles hosting. GitHub Actions free tier handles the weekly scrape.

**Fast page loads.** Data baked into the static build. No client-side API calls on load. Lighthouse performance score target of 90+ is achievable.

**Resilient data.** If a scrape run fails (selector miss, site down), the existing `grants.json` is preserved. The GitHub Actions workflow validates schema before committing.

**Simple deployment path.** One `git push` triggers Vercel rebuild. No CI/CD complexity to manage early on.

---

## Cons

**Scraper brittleness.** California government sites (CA DIR, county AJCC pages) frequently change HTML structure with no notice. CSS selectors break silently. The current scraper logs warnings and preserves existing data — but the `lastVerified` date will grow stale if scrapes keep failing. Mitigation: add a GitHub Actions alert (email or Slack) when a parser returns `None`.

**Static data is stale between weekly runs.** A grant program could close, change eligibility, or go offline. Users see the last-scraped state. Mitigation: display `lastVerified` prominently on each card (already implemented).

**No user input or feedback loop.** No way for a user to flag a broken link or incorrect eligibility. Mitigation: add a simple GitHub Issues link as a "Report a problem" button.

**`output: "export"` limits dynamic features.** Next.js static export means no server-side route handlers, no ISR, no server actions. If you add features that need a backend (email notifications, saved grants), you must remove `output: "export"` and switch to Vercel's serverless functions.

---

## Future Scalability

### Step 1 — Add a real database (Supabase / PostgreSQL)
Replace `grants.json` with a Supabase table. The Python scraper writes rows via the Supabase REST API instead of committing a file. The Next.js page fetches from Supabase at build time (ISR) or at request time.

```
scraper.py → supabase-py → grants table in Supabase
Next.js page → supabase-js → Server Component fetch
```

Benefit: deduplication, version history, admin UI for manual edits.

### Step 2 — Add user accounts (Clerk)
Integrate Clerk for auth. Users can save bookmarked grants. Saved state stored in a `user_bookmarks` table in Supabase (linked by Clerk user ID).

```
Clerk (auth) → user_id → Supabase user_bookmarks table
```

### Step 3 — Email notifications for new grants
When the scraper inserts a new grant row, trigger a Supabase Edge Function (or a GitHub Actions step using Resend / SendGrid) to notify subscribed users.

```
New row in grants table
  → Supabase trigger / Edge Function
  → Resend API
  → email to subscribers
```

Estimated effort: 2–3 days once Supabase and Clerk are connected.

### Step 4 — AI grant summary (Phase 4)
On the grant detail page, call the Anthropic API (claude-haiku-4-5-20251001 for cost efficiency) to summarize long eligibility text into 3 bullet points. Cache the result in Supabase to avoid repeated API calls.

```
grant.eligibility (long text)
  → Anthropic API (Haiku model)
  → 3-bullet summary
  → cached in grants.summary column
```

---

## Initialization Commands

```bash
# In your local clone of https://github.com/nattapongsindhu/grants-for-me

npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

# Then copy the files from this scaffolding into the initialized project.
# Install dependencies:
npm install

# Run locally:
npm run dev

# Python scraper setup:
cd scraper
pip install -r requirements.txt
python scraper.py
```

> **Note:** `create-next-app` will generate its own `package.json`, `tsconfig.json`, `tailwind.config.ts`, and `next.config.ts`. Replace them with the versions in this scaffold, or merge manually.
