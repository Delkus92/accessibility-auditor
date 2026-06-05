# Accessibility Auditor

Full-stack web accessibility auditing tool. Loads target URLs in a real headless Chromium browser, runs axe-core against the live DOM, and maps verified findings to all 78 WCAG 2.2 success criteria with legal framework mapping (ADA Title III, CA Unruh, NYSCRL, NYSHRL, NYCHRL).

## What it tests automatically

Automated scanning (axe-core) covers ~30–40% of WCAG 2.2 criteria — the deterministic, machine-verifiable ones:

- Alt text on images, inputs, iframes
- Color contrast ratios (computed from rendered CSS) — 1.4.3 and 1.4.6
- Form labels and ARIA labels
- Heading hierarchy
- Page title and language attributes
- Duplicate IDs and parsing errors
- All ARIA role/name/value/state rules (4.1.2)
- Autocomplete attributes on personal data fields
- Link purpose, button names, select names
- Skip navigation, landmark structure
- Meta viewport user-scalable restrictions
- Target size (2.5.8)
- And ~60 more axe-core rules

Criteria that require human judgment (screen reader behavior, live captions, keyboard trap testing, reflow at 320px, etc.) are marked **Manual required** with specific testing instructions.

## Tech Stack

- **Backend**: Node.js, Express, Playwright, axe-core, @axe-core/playwright
- **Frontend**: React, Vite
- **Deployment**: Railway or Render (Dockerfile included)

## Project Structure

```
accessibility-auditor/
├── backend/
│   ├── server.js       # Express API
│   ├── scanner.js      # Playwright + axe-core engine
│   ├── wcag-map.js     # axe rule → WCAG 2.2 mapping (authoritative)
│   ├── package.json
│   └── Dockerfile      # Required for headless Chromium on Railway/Render
└── frontend/
    ├── src/
    │   ├── App.jsx     # Main application
    │   └── index.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Deployment — Railway (Recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create accessibility-auditor --public --push
# or: git remote add origin https://github.com/YOUR_USERNAME/accessibility-auditor.git
#     git push -u origin main
```

### Step 2: Deploy the Backend

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo
3. Railway detects the `Dockerfile` automatically — click **Deploy**
4. In **Settings → Variables**, add:
   ```
   PORT=3001
   NODE_ENV=production
   ANTHROPIC_API_KEY=sk-ant-...   (optional, for report generation)
   ```
5. In **Settings → Networking → Generate Domain** — copy your backend URL (e.g. `https://accessibility-auditor-backend.up.railway.app`)

> **Important**: Railway needs to point at the `backend/` subdirectory.
> In **Settings → Source → Root Directory**, set it to `backend`

### Step 3: Deploy the Frontend

Option A — Railway (second service in same project):
1. In your Railway project → **+ New Service** → **GitHub repo** again
2. Set **Root Directory** to `frontend`
3. Add variable: `VITE_API_URL=https://your-backend-url.up.railway.app`
4. Railway auto-detects Vite and runs `npm run build`

Option B — Render (frontend as static site):
1. Go to [render.com](https://render.com) → **New Static Site**
2. Connect your GitHub repo
3. **Root Directory**: `frontend`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend-url.up.railway.app`

### Step 4: Set CORS

Back in Railway backend settings, add:
```
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

Redeploy backend. Done — your app is live.

## Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on port 3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # starts on port 5173, proxies /api to backend
```

Open http://localhost:5173

## Deployment on Render (Alternative to Railway)

### Backend on Render:
1. New **Web Service** → connect repo
2. **Root Directory**: `backend`
3. **Environment**: Docker
4. **Dockerfile Path**: `./Dockerfile`
5. Add environment variables (same as Railway)

### Frontend on Render:
1. New **Static Site** → connect repo
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. Add `VITE_API_URL`

## Important Notes

### Automated vs manual coverage
axe-core is the industry standard (used by Google, Microsoft, Deque) but covers ~30–40% of WCAG criteria. The tool clearly marks which results are machine-verified vs require manual testing. Never treat an automated pass as full compliance.

### Legal disclaimer
This tool provides technical accessibility analysis to assist qualified human auditors. It does not constitute legal advice. Legal conclusions about ADA, Unruh, NYSCRL, NYSHRL, or NYCHRL compliance require evaluation by a licensed attorney.

### Rate limiting
The API is rate-limited to 20 scans per IP per 15 minutes to prevent abuse. Adjust in `server.js` for your use case.

### Scaling
The in-memory scan store resets on server restart. For production use with multiple users, replace with Redis or a database. Each scan uses ~200–400MB RAM (headless Chromium). Plan accordingly.

## License

MIT
