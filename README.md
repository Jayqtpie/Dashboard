# GuidedBarakah — Command Center (MVP)

Local-first web dashboard for daily execution + growth tracking + funnel monitoring + system status visibility.

**Brand palette**
- Teal: `#1A535C`
- Gold: `#C9A84C`
- Cream: `#FAF0E6`

## Stack
- Next.js (App Router)
- Tailwind CSS v4
- SQLite (local file) via `better-sqlite3`

## Getting started

### 1) Install
```bash
cd /home/ubuntu/.openclaw/workspace/projects/guidedbarakah-command-center
npm install
```

### 2) Initialize the database (seed data)
```bash
npm run db:init
```

This creates:
- `./data/guidedbarakah.sqlite`

(Optional) Reset the DB (deletes the sqlite file and recreates it):
```bash
npm run db:reset
```

### 3) Run the dev server
```bash
npm run dev
```

Open:
- <http://localhost:3000>

## Pages
- `/today` — daily posting checklist, CTA keyword picker, 20-min engagement timer
- `/growth` — metrics, top hooks/CTAs, do more/stop/test notes
- `/funnel` — keyword trigger/click/purchase counts + conversion %
- `/ops-health` — System Status: Zapier success/fail, delivery errors, alerts

## Notes
- SQLite path can be overridden with `DB_PATH`:
  ```bash
  DB_PATH=/absolute/path/to/db.sqlite npm run dev
  ```
- This is an MVP: all updates are basic forms + API routes.
