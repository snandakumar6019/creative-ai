# Creative AI

A modern full-stack Next.js 15 application organized around product-specific creative workspaces. Each product keeps its brand context, Facebook Ad Library competitor pages, generator, assets, and creative history together.

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
3. In the Supabase SQL Editor, run these files in order:
   - `supabase/product-pages.sql`
   - `supabase/generated-creatives.sql`
   - `supabase/product-workspaces.sql`
4. Run `pnpm prisma:generate`.
5. Run `pnpm dev`.

`OPENAI_API_KEY` enables generation. Facebook Ad Library pages can be attached and opened without a Meta API token; `FACEBOOK_AD_LIBRARY_ACCESS_TOKEN` is only needed by the legacy API helper.
