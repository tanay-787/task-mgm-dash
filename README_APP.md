Task Management Dashboard (React + Google Apps Script)

Simple README for running the app locally and connecting the Apps Script backend.

Overview

- Frontend: React + TypeScript + Vite, styled with Tailwind + shadcn components (src/components/ui).
- Backend: Google Apps Script (doPost) that fetches https://dummyjson.com/todos, transforms tasks, and returns summary metrics. The GAS endpoint requires an accessToken stored in Script Properties.

Quick start (frontend)

1. Copy the Apps Script Code.gs into a GAS project and deploy as a Web App. Save the exec URL.
2. Create .env.local at repository root with:
   VITE_BACKEND_URL="<GAS_EXEC_URL>"  # optional for dev; otherwise app uses /api proxy
   VITE_ACCESS_TOKEN="your-secret-token"
3. Install dependencies: npm install
4. Start dev server: npm run dev

Dev CORS notes

- Google Apps Script responses do not include CORS headers by default. During local dev use one of:
  - Use the included Vite proxy: omit VITE_BACKEND_URL so the app posts to /api and Vite proxies to the GAS exec URL (configured in vite.config.ts).
  - Test the GAS endpoint directly with curl or Postman.

What the frontend does

- Posts { accessToken } to the backend and expects { tasks: [...], summary: { total, completed, pending } }.
- Renders summary cards and a searchable, sortable table containing raw and derived fields (priorityScore, statusLabel).
- UI components are shadcn-style in src/components/ui and Tailwind classes in src/App.css.

Where to look

- Frontend entry: src/main.tsx, main UI: src/App.tsx
- UI components: src/components/ui/
- Apps Script sample: backend/gas/Code_gs.txt (copy to Apps Script editor)

Deployment

- Frontend: standard Vite build (npm run build) and host static files.
- Backend: deploy via Apps Script "Web app". Store the access token with setAccessToken in the script editor.

Support

If you want, I can add a Netlify/Cloudflare Worker proxy for production CORS handling, or integrate the exec URL into the app and verify end-to-end.
