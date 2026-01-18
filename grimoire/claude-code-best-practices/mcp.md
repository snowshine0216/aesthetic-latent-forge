# Model Context Protocol (MCP) Best Practices

## 📚 Essential Documentation
- **[Official Claude Code MCP Docs](https://code.claude.com/docs/en/mcp)**: The primary resource for understanding how Claude Code interacts with MCP servers.

## 🛠️ Configuration & Management

### Files location
``` bash
cat ~/.claude.json
```

### Adding MCP Servers
To add a new MCP server to Claude Code, use the `claude mcp add` command. Below is an example of adding a server via HTTP transport:

```bash
claude mcp add \
  --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer <YOUR_TOKEN>"
```

### Useful CLI Commands

| Command | Description |
| :--- | :--- |
| `claude mcp add` | Add a new MCP server configuration. |
| `claude mcp list` | View all currently configured MCP servers. |
| `claude mcp remove` | Remove an existing MCP server. |

### Useful MCP Servers
``` bash
claude mcp add --transport http figma-remote-mcp https://mcp.figma.com/mcp
claude mcp add --transport sse atlassian https://mcp.atlassian.com/v1/sse
claude mcp add --transport http github https://api.githubcopilot.com/mcp
```



### Key Considerations
- **Transport**: Ensure you select the correct transport method (`stdio` or `http`).
- **Security**: Always use environment variables or secure prompts for sensitive tokens instead of hardcoding them.
- **Testing**: After setup, verify the server is responding correctly using `claude mcp list`.

---
*Refining our agentic forge, one protocol at a time.*
