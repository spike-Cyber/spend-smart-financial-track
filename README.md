# Spend Smart Clone

An upgraded full-stack finance tracker with:

- React frontend
- Express backend
- JWT cookie authentication
- bcrypt password hashing
- email notifications for create/update/delete data changes
- Optional MongoDB storage via `MONGO_URI`
- Local JSON fallback storage for instant local runs
- Dark mode
- Multiple dashboard sections: Overview, Transactions, Insights, and Settings

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## MongoDB setup

If you want MongoDB instead of local JSON storage, set:

```bash
MONGO_URI=your_mongodb_connection_string
```

Optional:

```bash
MONGO_DB_NAME=spend-smart
```

If `MONGO_URI` is not set or fails, the app falls back to `data/db.json`.

## JWT setup

Auth now uses signed JWT cookies instead of in-memory sessions.

Optional:

```bash
JWT_SECRET=your_long_random_secret
```

If `JWT_SECRET` is not set, the app uses a local development secret.

## Email notifications

The app can send mail notifications whenever financial data is created, updated, or deleted.

Configure SMTP with:

```bash
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email_user
SMTP_PASS=your_email_password
MAIL_FROM=your_from_address
```

If SMTP is not configured, the app falls back to a safe log-only mode instead of failing.

## Deploy on Render

This project is prepared for Render with [render.yaml](C:\Users\Aniket\Downloads\spend smart finacial track\render.yaml).

Recommended steps:

1. Push this project to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` automatically.
5. Add the missing secret values:
   - `MONGO_URI`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `MAIL_FROM`
6. Deploy the blueprint.

Build and start commands used:

```bash
npm install && npm run build
npm start
```

Health check:

```text
/api/health
```

Important:

- Render's local disk is not reliable for long-term app data.
- If you deploy without `MONGO_URI`, the app can still run, but JSON data may be lost on redeploy or restart.
- For a proper live deployment, set `MONGO_URI`.

## Structure

- `server/index.js` - Express server and API routes
- `server/lib/store.js` - storage adapters for MongoDB and JSON
- `src/client/app.jsx` - React application source
- `scripts/build-client.js` - bundles the React client with esbuild
- `public/` - built frontend assets
- `data/db.json` - local fallback data store
