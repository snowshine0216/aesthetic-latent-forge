# Aesthetic Latent Forge

A monorepo for AI prompt enhancement tools built with Next.js, Tailwind CSS, and Supabase.

## Project Structure

```
aesthetic-latent-forge/
├── apps/
│   ├── prompt-enhancer/     # Prompt polishing/enhancement tool
│   └── rag-tool/            # RAG (Retrieval-Augmented Generation) tool
├── packages/
│   ├── ui/                  # Shared React components
│   ├── supabase/            # Supabase client utilities
│   ├── logger/              # Shared logging utilities
│   ├── ai-utils/            # Shared LLM utilities
│   └── config/              # Shared ESLint, TypeScript, Tailwind configs
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Root package.json
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

```tsx
import { Button } from '@repo/ui'

<Button variant="primary">Click me</Button>
```

### @repo/supabase

Supabase client utilities for server and browser environments.

```tsx
// Browser client
import { createBrowserClient } from '@repo/supabase/client'
const supabase = createBrowserClient()

// Server client (in Server Components or Route Handlers)
import { createServerClient } from '@repo/supabase/server'
const supabase = await createServerClient()
```

### @repo/ai-utils

Shared utilities for LLM interactions.

```tsx
import { formatPrompt, truncateToTokenLimit } from '@repo/ai-utils'
```

### @repo/config

Shared configuration for TypeScript, ESLint, and Tailwind.

### @repo/logger

Zero-dependency, environment-aware logging for the monorepo. Provides structured JSON output in production and human-readable colored output in development.

```tsx
import { createLogger } from '@repo/logger'

const logger = createLogger('MyService')

logger.info('Application started')
logger.debug('Processing', { requestId: 'abc123' })
logger.warn('Rate limit approaching', { current: 95, limit: 100 })
logger.error('Failed to process', { error: 'Connection timeout' })

// Child loggers with context
const reqLogger = logger.child({ requestId: 'req-123' })
reqLogger.info('Request handled')
```

See [packages/logger/docs/README.md](packages/logger/docs/README.md) for full documentation.

## Adding a New App

1. Create a new directory in `apps/`:

```bash
mkdir -p apps/new-app/src/app
```

2. Copy the configuration from an existing app and modify as needed.

3. Update the `package.json` with a unique name and port.

4. Configure Vercel (or your hosting) to deploy the new app.

## License

MIT
