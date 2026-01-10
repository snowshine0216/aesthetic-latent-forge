# Project Brainstorm: AI Prompt Enhancement Platform

## Project Vision
Build an open-source platform using **Next.js + Tailwind CSS + Supabase** to:
1. **Phase 1**: Polish/enhance prompts to be more suitable for LLM input
2. **Phase 2**: Add RAG (Retrieval-Augmented Generation) capabilities
3. **Phase N**: Expand with additional sub-projects/tools on different domains

## Architecture Decision: Monorepo

### Why Monorepo (Recommended)
- Single tech stack across all features (Next.js, Tailwind, Supabase)
- Shared Supabase backend (auth, users, shared tables)
- Shared UI components, utilities, and types
- Related problem domain (AI/LLM tooling)
- Single user account system across all tools
- All projects are open source
- Single team (no access isolation needed)

### Structure
```
<project-name>/
├── apps/
│   ├── prompt-enhancer/        # First Next.js app
│   ├── rag-tool/               # Future RAG tool
│   └── [future-projects]/
├── packages/
│   ├── ui/                     # Shared Tailwind components
│   ├── supabase/               # Shared Supabase client & types
│   ├── ai-utils/               # Shared LLM utilities
│   └── config/                 # Shared ESLint, TS configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Tech Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package Manager | **pnpm** | Best for monorepos (strict, fast, disk efficient) |
| Build Orchestrator | **Turborepo** | Vercel-owned, native Next.js integration, multi-app deploys |
| Deployment | **Vercel** | Native Turborepo support, easy subdomain routing (enhancer.*, rag.*) |
| Auth/DB | **Supabase** | Already chosen, handles users table, works across apps |

## Adding New Apps Later
Simply:
1. Create new app in `apps/new-tool/`
2. Configure new Vercel project pointing to that directory
3. Shared packages automatically work via workspace config

## Project Naming (Top Candidates)

### Strong Contenders
1. **PromptForge** ⭐ — Professional, implies craftsmanship
   - Clear purpose, memorable, strong brand
2. **Refiner** — Short, clean, works as umbrella brand for multiple tools
3. **Nexus** — Trendy, works as org name, suggests connection

### Alternative Styles
- **PromptStudio** — Creative space vibe
- **PromptLab** — Experimental, collaborative
- **Prism** — Elegant metaphor (refracts chaos into clarity)

## Next Steps
- [ ] Decide on final project name
- [ ] Scaffold monorepo with Turborepo + pnpm
- [ ] Set up first Next.js app (prompt-enhancer)
- [ ] Configure Supabase integration
- [ ] Set up Vercel deployment
- [ ] Build prompt enhancement feature

## Key Architecture Constraints
- Single Supabase project (shared auth/DB)
- Shared component library as projects grow
- Independent deployment for each app
- All repos stay open source
