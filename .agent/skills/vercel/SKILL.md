---
name: Vercel Deployment & Management
description: Comprehensive guide and utilities for managing Vercel projects, deployments, and environment variables using the Vercel CLI.
---

# Vercel Skill

This skill provides capabilities to interact with Vercel for deployment, project management, and environment configuration.

## Prerequisites

- Node.js installed
- Vercel CLI (`npm i -g vercel` or usage via `npx vercel`)
- A Vercel account
- **Important**: For CI/CD or Agentic use, a Vercel Access Token is recommended to avoid interactive login prompts. Set it as `VERCEL_TOKEN`.

## Common Commands

### 1. Deployment

**Deploy to Preview:**
```bash
npx vercel
```

**Deploy to Production:**
```bash
npx vercel --prod
```

**Deploy with specific token (useful for agents):**
```bash
npx vercel --prod --token <YOUR_TOKEN>
```

### 2. Project Linking

Link the current directory to a Vercel project:
```bash
npx vercel link
```
*Note: This is often interactive. If running in a non-interactive environment, ensure the project is already linked or use `--yes` with pre-configuration.*

### 3. Environment Variables

**Pull Environment Variables:**
Download development environment variables to `.env.local`:
```bash
npx vercel env pull .env.local
```

**Add Environment Variable:**
```bash
npx vercel env add <name> [value] [environment]
# Environment can be: production, preview, or development
```

### 4. Build

Build the project locally to check for errors before deploying:
```bash
npx vercel build
```

## Workflows

### Initial Setup
1. Run `npx vercel login` (User must do this interactively once, or provide tokens).
2. Run `npx vercel link` to associate the codebase with a Vercel project.
3. Run `npx vercel env pull` to get necessary secrets.

### Continuous Deployment
The preferred way to deploy is pushing to a Git repository connected to Vercel (GitHub/GitLab/Bitbucket).
Manual deployments via `npx vercel --prod` are useful for ad-hoc updates or testing.

## Advanced Usage

### Inspecting Deployments
List deployments:
```bash
npx vercel ls
```

Inspect a specific deployment:
```bash
npx vercel inspect <url_or_id>
```

### Alias
Assign a custom domain or alias to a deployment:
```bash
npx vercel alias set <deployment-url> <custom-domain>
```
