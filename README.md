# Defect Tracker

A defect/issue tracker with projects, role-based access, and a per-defect audit trail, built with Next.js (App Router, React, server actions, Tailwind CSS), Prisma with the `@prisma/adapter-pg` driver adapter, PostgreSQL, and Auth.js (`next-auth`) using a JWT session strategy.

## Prerequisites

- Node 20+
- A running PostgreSQL 16 instance

## Installation

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

Install dependencies, apply migrations, and seed demo data:

```bash
npm install
npm run db:deploy   # apply migrations (or `npm run db:migrate` in dev)
npm run db:seed     # optional demo data
```

The seed creates two accounts (password `password123`) and a sample project:
- `alice@example.com` (project OWNER)
- `bob@example.com` (project MEMBER)

## Usage

```bash
npm run dev                  # dev server, http://localhost:3000
npm run build && npm start   # production build and serve
```
