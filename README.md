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

1. Create a new Railway project.
2. Add the PostgreSQL plugin.
3. Copy the generated `DATABASE_URL` from Railway into your project environment.
4. Deploy the app.

Railway will provide a live Postgres URL such as:

```
postgres://user:password@host:5432/database
```

Set that value as `DATABASE_URL` in Railway, and the app will connect automatically.

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

