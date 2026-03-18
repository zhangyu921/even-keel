# EvenKeel

> Keeping your family finances on an even keel.

A family wealth tracking app where both partners manage and monitor household finances together — no more scattered spreadsheets.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js v5
- **Charts**: Recharts
- **Deployment**: Vercel + Supabase/Neon (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)

### Setup

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env

# Start PostgreSQL
docker compose up -d

# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
even-keel/
├── prisma/
│   └── schema.prisma          # Data model
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/auth/          # NextAuth API routes
│   │   ├── dashboard/         # Main dashboard
│   │   ├── accounts/          # Account management
│   │   ├── analysis/          # Charts & insights
│   │   └── settings/          # Family & user settings
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Shared utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── validations.ts     # Zod schemas
│   └── generated/prisma/      # Generated Prisma client
├── docker-compose.yml         # Local PostgreSQL
└── .env.example               # Environment template
```

## Key Features

- **No monthly cycles** — update any account balance at any time
- **Family sharing** — both partners see and manage all accounts
- **Visual guidance** — smart prompts to keep all accounts up to date
- **Trend analysis** — track net worth over time with interactive charts
- **AI insights** — natural language financial summaries (planned)

## License

MIT
