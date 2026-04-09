# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Repository Overview

**TriStateApp** is a project hosted at `bjsnyder7/TriStateApp` on GitHub. As of the last update to this file, the repository is in its initial state — no application code has been written yet. This document establishes the conventions and workflows that should be followed as the project grows.

## Current State

```
TriStateApp/
├── CLAUDE.md       # AI assistant guidance (this file)
├── README.md       # Project README (currently contains only git init commands)
└── dataHQ          # Placeholder file (empty)
```

- No framework, language, or technology stack has been committed yet.
- No tests, CI/CD, or build tooling are configured.
- No database schema or API definitions exist.

When the stack is decided and initial code is committed, update this file to reflect the actual structure, conventions, and workflows.

## Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `claude/<description>` | AI-generated feature/documentation branches |

### Feature Branch Convention

- Branch names use lowercase kebab-case: `feature/my-feature`, `fix/the-bug`, `claude/task-description`
- Development branches are created from `main`
- Changes are merged back to `main` via pull requests

### Commit Message Style

The repository uses standard imperative-mood commit messages:

```
<type>: <short summary>

<optional body>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat: add user authentication`
- `fix: resolve null pointer in data parser`
- `docs: update README with setup instructions`

### Pushing Changes

Always push with tracking:
```bash
git push -u origin <branch-name>
```

For network failures, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

## Development Workflows

Since no tech stack is set yet, the following are placeholder instructions to be updated once the stack is chosen.

### Setup

```bash
# Clone the repository
git clone https://github.com/bjsnyder7/TriStateApp.git
cd TriStateApp
```

### Running the App

> Not yet configured. Update this section once a framework and entry point are established.

### Running Tests

> Not yet configured. Update this section once a test framework is chosen.

### Building for Production

> Not yet configured. Update this section once a build pipeline is defined.

## Code Conventions

These conventions should be adopted once development begins:

### General

- Prefer explicit over implicit code
- Keep functions small and single-purpose
- Validate all external input at system boundaries; trust internal code
- Do not add error handling for scenarios that cannot occur
- Avoid premature abstractions — three similar lines of code is better than a speculative helper

### File Organization

- Group related functionality together in directories
- Keep configuration files at the project root
- Place tests alongside source files or in a top-level `tests/` directory

### Security

- Never commit secrets, API keys, or credentials — use environment variables
- Sanitize and validate all user input
- Follow OWASP Top 10 guidelines when implementing web endpoints

## Environment Variables

> No environment variables are defined yet. When added, document each variable here with its purpose and whether it is required or optional.

| Variable | Required | Description |
|----------|----------|-------------|
| _(none yet)_ | — | — |

## Key Files to Know

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI assistant guidance (this file) |
| `README.md` | Human-facing project documentation |
| `dataHQ` | Placeholder — purpose TBD |

## Notes for AI Assistants

- **Do not push to `main` directly.** Always work on a feature branch and open a pull request.
- **Do not create a pull request unless the user explicitly asks for one.**
- **Read files before editing them.** Never modify code you haven't read.
- **Match the scope of changes to what was asked.** Do not add features, refactor surrounding code, or improve code beyond the explicit request.
- **Do not add speculative abstractions, helpers, or utilities** for one-time operations.
- **Keep this file up to date** whenever significant architectural changes are made — new tech stack, new conventions, new environment variables, etc.
