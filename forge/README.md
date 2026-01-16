# 🔥 The Forge

This is the core workspace of the Aesthetic Latent Forge. It is organized as a Turborepo monorepo.

## Project Structure

```
forge/
├── apps/
│   ├── prompt-enhancer/     # Prompt polishing/enhancement tool
│   └── rag-tool/            # RAG (Retrieval-Augmented Generation) tool
├── packages/
│   ├── ui/                  # Shared React components
│   ├── supabase/            # Supabase client utilities
│   ├── logger/              # Shared logging utilities
│   ├── ai-utils/            # Shared LLM utilities
│   ├── resilience/          # Resilience patterns (retry, bulkhead, timeout)
│   └── config/              # Shared ESLint, TypeScript, Tailwind configs
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Workspace package.json
```

## Tech Stack

- **Runtime**: Node.js 22
- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database/Auth**: Supabase
- **Language**: TypeScript (strict mode)

## Caching Strategy

This project uses a two-tier caching strategy to avoid the need for external Redis infrastructure:

1. **Next.js Data Cache (`unstable_cache`)**: For app-specific caching of LLM responses and expensive API results. Native to Vercel and zero configuration.
2. **Supabase DB Cache**: For shared, persistent cache across the monorepo (e.g., shared prompt templates, RAG embeddings metadata). Implemented via a dedicated PostgreSQL table.

## Getting Started

### Prerequisites

- Node.js 22+ (`nvm use` to switch if using nvm)
- pnpm 9+ (`npm install -g pnpm`)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Environment Setup

1. Copy the example environment file in each app:

```bash
cp apps/prompt-enhancer/.env.example apps/prompt-enhancer/.env.local
cp apps/rag-tool/.env.example apps/rag-tool/.env.local
```

2. Update the `.env.local` files with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start a specific app
pnpm dev --filter @repo/prompt-enhancer
pnpm dev --filter @repo/rag-tool
```

- **prompt-enhancer**: http://localhost:3000
- **rag-tool**: http://localhost:3001

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all apps and packages |
| `pnpm lint:fix` | Lint and fix all apps and packages |
| `pnpm type-check` | Type check all apps and packages |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting |

## Packages

### @repo/ui
Shared React component library with Tailwind CSS styling.

### @repo/supabase
Supabase client utilities for server and browser environments.

### @repo/ai-utils
Shared utilities for LLM interactions.

### @repo/config
Shared configuration for TypeScript, ESLint, and Tailwind.

### @repo/logger
Zero-dependency, environment-aware logging for the monorepo.

### @repo/resilience
Resilience and fault-handling library using `cockatiel`.

## Adding a New App

1. Create a new directory in `apps/`:
```bash
mkdir -p apps/new-app/src/app
```
2. Copy the configuration from an existing app and modify as needed.
3. Update the `package.json` with a unique name and port.
4. Configure Vercel (or your hosting) to deploy the new app.
