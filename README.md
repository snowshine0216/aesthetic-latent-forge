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
- **[Xmind]**: https://github.com/BangyiZhang/xmind-generator-mcp
- **[Figma]**: https://github.com/GLips/Figma-Context-MCP
- **[GitHub]**: https://github.com/github/github-mcp-server

### GitHub MCP Server
1. download
```bash
curl -L https://github.com/github/github-mcp-server/releases/download/v0.29.0/github-mcp-server_Darwin_x86_64.tar.gz -o mcp.tar.gz \
&& tar -xzf mcp.tar.gz \
&& chmod +x github-mcp-server
```
2. move to local bin
```bash
# Move the binary to a global location
sudo mv github-mcp-server /usr/local/bin/

# trust the binary-optional
sudo xattr -rd com.apple.quarantine github-mcp-server

# Verify it works from any directory
github-mcp-server --version
```

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
    },
    "figma-context-mcp": {
      "type": "stdio",
      "command": "/Users/xuyin/.nvm/versions/node/v22.21.1/bin/npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=your-figma-api-key", "--stdio"]
    }
  },
   "github": {
        "command": "github-mcp-server",
        "args": ["stdio"],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>",
          "GITHUB_TOOLS": "get_file_contents,pull_request_read,search_code, search_pull_requests, search_repositories, get_commit, list_branches, list_commits, list_pull_requests"
        }
      },
  "mcp-atlassian": {
      "command": "uvx",
      "args": [
        "--python=3.12",
        "mcp-atlassian",
        "--enabled-tools",
        "confluence_search,confluence_get_page,jira_get_issue,jira_search"
      ],
      "env": {
        "JIRA_URL": "https://strategyagile.atlassian.net",
        "JIRA_USERNAME": "your@microstrategy.com",
        "JIRA_API_TOKEN": "<YOUR_TOKEN>",
        "CONFLUENCE_URL": "https://your-company.atlassian.net/wiki",
        "CONFLUENCE_USERNAME": "your@microstrategy.com",
        "CONFLUENCE_API_TOKEN": "<YOUR_TOKEN>"
      }
    }
}
```
