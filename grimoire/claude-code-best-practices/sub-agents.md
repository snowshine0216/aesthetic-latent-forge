# Sub-Agents Best Practices

## 📚 Essential Documentation
- **[Official Claude Code Sub-Agents Docs](https://code.claude.com/docs/en/sub-agents)**: The primary resource for understanding how Claude Code interacts with sub-agents.

## 🛠️ Configuration & Management
- project level agents: `.claude/agents/`
- user level agents: `~/.claude/agents/`


## CLI to create agents
```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```