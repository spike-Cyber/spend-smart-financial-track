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

## Command groups

The project commands are now separated more clearly:

```bash
npm run build:client
npm run start:server
npm run reset
npm run reset:rebuild
```

Reset commands:

```bash
npm run reset
```

Restores:

- `data/db.json` back to the clean snapshot in [db.initial.json](C:\Users\Aniket\Downloads\spend smart finacial track\data\db.initial.json)
- removes temporary mail/server log files

If you also want a fresh rebuilt client bundle after reset:

```bash
npm run reset:rebuild
```

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

## Deployment Note

This project is currently documented for local/full-stack usage only.

## Structure

- `server/index.js` - Express app factory and local server entry
- `server/lib/store.js` - storage adapters for MongoDB and JSON
- `src/client/app.jsx` - React application source
- `scripts/build-client.js` - bundles the React client with esbuild
- `public/` - built frontend assets
- `data/db.json` - local fallback data store
