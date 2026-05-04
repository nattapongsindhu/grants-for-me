# 🎓 Grants for Me: Free CA Workforce Training Grants

[![Deploy with Vercel](https://vercelbadge.vercel.app/api/nattapongsindhu/grants-for-me)](https://grants-for-me.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python Scraper](https://img.shields.io/badge/Python-Data_Pipeline-ffd343?logo=python&logoColor=blue)](https://python.org)
[![Automated Scraper](https://github.com/nattapongsindhu/grants-for-me/actions/workflows/scraper.yml/badge.svg)](https://github.com/nattapongsindhu/grants-for-me/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A minimal, highly performant grant discovery web application focused on free workforce training opportunities in California (IT, Maintenance, and Healthcare).

Live Demo: [grants-for-me.vercel.app](https://grants-for-me.vercel.app)

---

## 📌 Project Purpose
Navigating government and institutional training grants can be overwhelming. This project solves that by aggregating high-impact, fully-funded programs (like WIOA, Futuro Health, and Per Scholas) into a single, easily filterable dashboard. 

Built as a portfolio piece to demonstrate **product sense, automated data pipelines, accessibility (a11y), and maintainable architecture**.


---

## Architecture

```
GitHub Repository
├── scraper/               Python scraper (BeautifulSoup)
│   └── scraper.py         Fetches, sanitizes, and writes grants.json
│
├── public/data/
│   └── grants.json        Source of truth for all grant data
│
├── src/                   Next.js application (App Router)
│   ├── app/page.tsx        Server component — reads grants.json at build time
│   ├── app/GrantsClient.tsx Client component — search, filter, URL state
│   └── components/        GrantCard, SearchBar, FilterCategory
│
└── .github/workflows/
    └── scraper.yml        GitHub Actions cron — runs scraper twice daily,
                           commits updated grants.json, triggers Vercel rebuild
```

**Data flow:**
```
GitHub Actions (cron: 0 13,1 * * *)
  → python scraper.py
  → writes public/data/grants.json
  → git commit + push
  → Vercel detects push → rebuilds static site
  → users see updated data
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router) | Static export, SSG, file-system data access at build time |
| Styling | Tailwind CSS | Utility-first, no runtime CSS overhead |
| Hosting | Vercel | Zero-config static deployment, global CDN |
| Scraper | Python 3.12, BeautifulSoup | Lightweight HTML parsing without a headless browser |
| Automation | GitHub Actions | Free cron runner; commits data back to repo on schedule |
| Data format | JSON | No database required for this data size; fast to read at build |

---

## Data Pipeline Reliability

The scraper is designed to fail safely:

1. **Preserves existing data on failure.** If a fetch or parse fails, the existing `grants.json` is kept unchanged. The scraper never writes a partial or empty file.
2. **Schema validation in CI.** The GitHub Actions workflow runs a Python schema check after every scrape — validates required fields on every grant record before committing.
3. **Input sanitization.** All text parsed from external HTML is stripped of tags and capped at 300 characters before writing to JSON, preventing markup injection.
4. **Rate limiting.** A 2-second delay between requests avoids triggering bot detection on source sites.
5. **Stale data banner.** The UI checks `lastUpdated` on every load. If data is older than 3 days (e.g., if the scraper job failed silently), a warning banner is shown to users.

---

## Grant Data Sources

| Grant | Source | Region |
|---|---|---|
| WIOA via AJCC / CalJOBS | caljobs.ca.gov | California |
| Per Scholas Los Angeles | perscholas.org | Los Angeles County |
| Futuro Health — Registered Dental Assistant | futurohealth.org | California |
| Dental Assistant Apprenticeship | dir.ca.gov | California |
| County Workforce Programs | edd.ca.gov | California |
| Maintenance Mechanic Apprenticeship | chaffey.edu | California |
| Hospital / Health Center Paid Training | ccalac.org | Los Angeles County |
| California Cybersecurity Workforce Grants (RAMPS) | cde.ca.gov | California |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- npm

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build static output (output/ directory)
npm run build
```

### Python Scraper

```bash
cd scraper

# Install dependencies
pip install -r requirements.txt

# Run scraper (writes to public/data/grants.json)
python scraper.py
```

**Note:** CSS selectors in `scraper.py` are placeholders. Inspect the live source pages and update the selectors before relying on the scraper for production data.

---

## Deployment

This project deploys automatically via Vercel:

1. Connect the GitHub repository to Vercel (New Project → Import).
2. Framework: **Next.js**. Build command: `npm run build`. Output: `.next` (or `out/` for static export).
3. Every push to `main` triggers a rebuild and deployment.
4. The GitHub Actions scraper commits `grants.json` twice daily → Vercel detects the push → site rebuilds with fresh data.

### Security Headers

`vercel.json` sets the following headers on every response:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control: public, max-age=3600` on `/data/` assets

---

## URL State

Search and filter state is synchronized with the URL:

```
/                          → all grants
/?category=IT%2FCybersecurity  → filtered by IT/Cybersecurity
/?query=comptia            → search results for "comptia"
/?category=Healthcare&query=dental → combined filter
```

Sharing or bookmarking a filtered URL restores the exact view on load.

---

## Future Roadmap

| Priority | Feature |
|---|---|
| High | Replace JSON with Supabase table; scraper writes via REST API |
| High | Add Clerk authentication for user accounts |
| Medium | Email notifications when new grants are added (Resend + Supabase triggers) |
| Medium | Grant detail pages with slug-based routing |
| Medium | JSON-LD structured data (`ItemList` / `GovernmentService`) for rich search results |
| Low | AI-generated 3-bullet eligibility summaries per grant (Anthropic API, cached) |
| Low | User bookmark / saved grants feature |

---

## License

MIT — see [LICENSE](./LICENSE).
