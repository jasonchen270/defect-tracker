# Defect Tracker

A defect/issue tracker with projects, role-based access, and a per-defect audit
trail. Next.js (App Router) + Prisma 7 + PostgreSQL + Auth.js (NextAuth v5).

## Stack

- **Next.js 16** App Router, React 19, server actions, Tailwind CSS v4.
- **Prisma 7** with the `@prisma/adapter-pg` driver adapter (Prisma 7 connects
  through an adapter rather than a `url` in the schema).
- **PostgreSQL**.
- **Auth.js v5** (`next-auth@5`) with a JWT session strategy.

## Getting started

### 1. Prerequisites
- Node 20+
- A running PostgreSQL instance.

### 2. Configure environment
Create a `.env` with:

```bash
DATABASE_URL="postgresql://USER@localhost:5432/defect_tracker"
AUTH_SECRET="<run: npx auth secret>"
AUTH_TRUST_HOST="true"
```

Create the database (once):

```bash
createdb defect_tracker
```

### 3. Install, migrate, seed

```bash
npm install
npm run db:deploy   # apply migrations (or `npm run db:migrate` in dev)
npm run db:seed     # optional demo data
```

The seed creates two accounts (password `password123`) and a sample project:
- `alice@example.com` (project OWNER)
- `bob@example.com` (project MEMBER)

### 4. Run

```bash
npm run dev     # http://localhost:3000
```

Or a production build:

```bash
npm run build && npm start
```
