# Coptic Daily Readings — Starter

Minimal Next.js starter for the Daily Readings & Reflections site. This scaffold includes:

- Homepage with a reading card
- Client-side likes persisted to `localStorage`
- Comments with a simple profanity auto-block and local persistence


Quick start:

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the homepage.

The app now includes a saint-based account system with a fresh sign in / register experience at `/signin`.

This app persists data directly to a PostgreSQL database using server-side API routes. Set `DATABASE_URL` in your environment and run the provided SQL schema to create the required tables.

### Deploying on Railway

Railway is a good fit for this project. You can host the app and Postgres together without running Docker locally.

#### Steps:

1. Create a new Railway project.
2. Add the PostgreSQL plugin to your project.
3. Railway will generate two connection strings:
   - **Internal URL** (for connections within Railway): `postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway`
   - **Public URL** (for external connections): `postgresql://postgres:PASSWORD@yamanote.proxy.rlwy.net:PORT/railway`
4. In your Railway project **environment variables**, set:
   - **Key:** `DATABASE_URL`
   - **Value:** *(use the Internal URL for best performance)*
5. Connect your GitHub repository to Railway and deploy.

#### Which URL to use?

- **Internal URL** (`.railway.internal`): Use this when your app is deployed on Railway. It's faster and doesn't go through the internet.
- **Public URL** (`.proxy.rlwy.net`): Use this if you're testing the app locally or connecting from outside Railway.

#### Important

- The app **requires** `DATABASE_URL` in production. If it's missing, the app will fail to start with a clear error.
- Railway's Postgres plugin will handle database provisioning and URL generation automatically.
- The SQL schema will be created on first connection if it doesn't exist.

### Local development

If you prefer local development, keep `.env.local` with a local Postgres connection string, or use the existing `docker-compose.yml` to run Postgres locally.

Example local `.env.local`:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/coptic_daily_readings
```

The app now uses PostgreSQL for authentication, comments, and likes.

If the database is not configured or the connection fails in production, the app will throw an error asking for `DATABASE_URL`.

Next steps implemented in this branch:
- Direct Postgres persistence via `pg` and API routes.
- Cookie-based session authentication, with email/password sign in and register.
- Comments CRUD and reaction/like handling through backend APIs.
- Admin moderation page and comment status updates.

Planned next work:
- Add DB migrations and seed data.
- Harden auth and session expiration handling.
- Improve moderation workflows and comment visibility.
- Add support for more user profile fields.

