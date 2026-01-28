# ✨ Aesthetic Latent Forge

A mystical laboratory for AI prompt enhancement tools, where leaden prompts are transmuted into golden latent experiences.

## 🏰 The Chambers

### [🔥 Forge](./forge)
The active workshop. This is where the core machinery lives—Next.js applications, shared packages, and the infrastructure that powers the forge.
*   **Purpose**: Production code, active development, and core logic.
*   **Quick Start**: `cd forge && pnpm install && pnpm dev`

### [📜 Grimoire](./grimoire)
The collection of spells and wisdom. This chamber houses research papers, prompt engineering techniques, and deep-dives into latent space.
*   **Purpose**: Learning materials, documentation of discoveries, and AI research notes.

### [💎 Transmutations](./transmutations)
The standard formulas and pure archetypes. Here you will find "Gold Standard" boilerplate, reusable design patterns, and best practices.
*   **Purpose**: Ensuring consistency and high quality across all experiments.

---

## 🛠 Project Foundations

- **Runtime**: Node.js 22
- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS v4
- **Database/Auth**: Supabase

For detailed technical documentation, please refer to the [Forge README](./forge/README.md).


---
## MCP Servers
- **[Xmind]**: https://github.com/BangyiZhang/xmind-generator-mcp.

```json
{
  "mcpServers": {
    "playwright-mcp": {
      "type": "stdio",
      "command": "/Users/xuyin/.nvm/versions/node/v20.18.2/bin/node",
      "args": [
        "/Users/xuyin/.nvm/versions/node/v20.18.2/lib/node_modules/@executeautomation/playwright-mcp-server/dist/index.js"
      ]
    },
    "context7": {
      "type": "stdio",
      "command": "/Users/xuyin/.nvm/versions/node/v20.18.2/bin/node",
      "args": [
        "/Users/xuyin/.nvm/versions/node/v20.18.2/lib/node_modules/@upstash/context7-mcp/dist/index.js"
      ]
    },
    "xmind-generator": {
      "type": "stdio",
      "command": "/Users/xuyin/.nvm/versions/node/v22.21.1/bin/node",
      "args": ["/Users/xuyin/Documents/Repository/xmind-generator-mcp/dist/index.js"],
      "env": {
        "outputPath": "/Users/xuyin/Documents/FeatureTest/QAPlans",
        "autoOpenFile": "false"
      }
    }
  }
}
```
