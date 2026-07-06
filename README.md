# Creative AI

A modern full-stack Next.js 15 application for managing product pages, competitor intelligence, generated ads, and AI creative workflows.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Supabase authentication, database, and storage
- Prisma ORM
- OpenAI placeholder module

## Setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill in Supabase and database values.
3. Run `pnpm prisma:generate`.
4. Run `pnpm dev`.

The OpenAI integration is intentionally a placeholder in `lib/openai.ts`.
