# Zantara Web

## Runtime

- Node.js `22.14.0`
- Install with `npm ci`
- Run locally with `npm run dev`
- Verify with `npm test`, `npm run lint`, and `npm run typecheck`
- Build with `npm run build`

Copy `.env.example` to a local ignored environment file and set `VITE_API_BASE_URL` to the backend HTTPS origin without `/api`. The API client appends `/api`. Non-development builds fail when this value is missing or invalid.

## Netlify

Configure `VITE_API_BASE_URL=https://vtu-backend-xdmg.onrender.com` for the testing site. The backend must allow `https://dahavtu.netlify.app` through `CORS_ORIGIN` and use it as `CLIENT_BASE_URL`.

`public/_redirects` provides only the single-page application fallback. API requests go directly to the configured backend; Netlify does not proxy `/api`.

Build command: `npm run build`

Publish directory: `dist`
