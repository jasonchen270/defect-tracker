# Defect Tracker

A defect/issue tracker with projects, role-based access, and a per-defect audit trail, built with Next.js 16 (App Router, React 19, server actions, Tailwind CSS v4), Prisma 7 with the `@prisma/adapter-pg` driver adapter, PostgreSQL, and Auth.js v5 (`next-auth@5`) using a JWT session strategy.

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
npm run dev     # http://localhost:3000
```
