# Welcome to your Croell Digital Marketplace-Claude CRM

# Build with Antigravity

Open your project in the [Antigravity editor](https://www.antigravity.com) and keep building.

- **Ship faster**: describe what you want to build and Antigravity handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Antigravity is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Antigravity, ready for your next prompt.

## Overview

**crowell digitall marketpace - claude CRM** is a lead pipeline, employment/contract tracking, and outreach CRM supporting **ZapAI**, **Newton Health**, and **KinematicOps**.

### Key Routes

- `/` (`/dashboard`) — Kanban Lead Pipeline Board (`PipelineBoard`)
- `/leads` — Filterable Leads Table & Lead Detail Drawer (brand, job type, stage, priority, play, and employment details)
- `/outreach` — Outreach Draft Generation & Status Tracking (`Draft`, `Approved`, `Sent`, `Bounced`)

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

### Scripts

- `npm run dev` — Start the local TanStack Start + Vite development server (`http://localhost:8080/`)
- `npm run build` — Build client and SSR/Nitro production bundles (`.output/`)
- `npx tsc --noEmit` — Run TypeScript type checking

## Built with

- TanStack Start & TanStack Router
- TypeScript
- React 19
- Tailwind CSS v4
- Supabase & Drizzle ORM
