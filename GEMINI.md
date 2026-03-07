# Gemini CLI-Specific Instructions

> **Note:** This file works alongside `AGENTS.md`, which contains the core repo guidance for all agents. This file is only for Gemini CLI-specific behavior. When I say ultrathink, go into king mode using `gemini-king-mode.md`.

## Gemini CLI-Specific Features

### Session Management

Built-in session commands:

- `/chat` - Start new conversation while keeping context
- `/checkpoint save <name>` - Save session state
- `/checkpoint load <name>` - Resume saved session
- `/memory show` - View loaded context

Both `AGENTS.md` and `GEMINI.md` are auto-loaded on every Gemini CLI session.

### Headless Mode for Automation

Non-interactive mode for scripts:

```bash
# Simple text response
gemini -p "What's the next task?"

# JSON output for parsing
gemini -p "List all pending tasks" --output-format json

# Stream events for long operations
gemini -p "Expand all tasks" --output-format stream-json
```

### Token Usage Monitoring

```bash
# In Gemini CLI session
/stats

# Shows: token usage, API costs, request counts
```

### Google Search Grounding

Leverage built-in Google Search as an alternative to Perplexity research mode:
- Best practices research
- Library documentation
- Security vulnerability checks
- Implementation patterns

## Important Differences from Other Agents

### No Slash Commands
Gemini CLI does not support custom slash commands (unlike Claude Code). Use natural language instead.

### No Tool Allowlist
Security is managed at the MCP level, not via agent configuration.

### Session Persistence
Use `/checkpoint` instead of git worktrees for managing multiple work contexts.

### Configuration Files
- Global: `~/.gemini/settings.json`
- Project: `.gemini/settings.json`
- **Not**: `.mcp.json` (that's for Claude Code)

## Your Role with Gemini CLI

As a Gemini CLI assistant on this repo:

1. **Use local docs first** - Start with `docs/README.md`, `JOURNAL.md`, and the current roadmap/spec docs
2. **Reference files with @** - Leverage Gemini's file inclusion
3. **Save checkpoints** - Offer to save state after significant progress
4. **Monitor usage** - Remind users about `/stats` for long sessions
5. **Use Google Search** - Leverage search grounding for research

**Key Principle:** Focus on natural conversation, grounded in the repo itself rather than an external task orchestration layer.

---

*See `AGENTS.md` for the active repository workflow and operating rules.*
