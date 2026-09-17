# Workflo

Workflo is a Slack-style team workspace chat app: organizations, channels, threads, emoji reactions, presence, rich-text messages, and AI-assisted composing/summarizing — built on Next.js App Router with real-time delivery via a PartyKit worker.

## Features

- **Workspaces & channels** — each Kinde organization is a workspace; workspaces contain channels
- **Threaded conversations** — reply to any message in a dedicated thread sidebar without cluttering the main channel
- **Rich-text composer** — TipTap-based editor with bold/italic/strike/code, ordered/unordered lists, undo/redo, and an AI "Compose" assist button
- **Emoji reactions** — per-user, toggleable reactions with live counts, kept in sync across every connected client
- **Image attachments** — drag-in image uploads via UploadThing
- **Presence** — see who's online in a workspace and in the members list
- **AI thread summaries** — one-click LLM summary of a thread's discussion (via OpenRouter)
- **Real-time everything** — new messages, edits, reactions, and reply counts propagate instantly through a PartyKit-powered WebSocket layer
- **Security middleware** — Arcjet-backed rate limiting, bot detection, shield (WAF), and sensitive-info scanning on every write path

## Tech stack

| Layer         | Choice                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Framework     | Next.js (App Router) + TypeScript                                               |
| Styling / UI  | Tailwind CSS + shadcn/ui                                                        |
| API layer     | [oRPC](https://orpc.unnoq.com/) (typed RPC over a single `/rpc` route)          |
| Data fetching | TanStack Query                                                                  |
| Database      | PostgreSQL via Prisma                                                           |
| Auth & orgs   | [Kinde](https://kinde.com/) (organizations = workspaces)                        |
| Real-time     | [PartyKit](https://partykit.io/) / partyserver, deployed as a Cloudflare Worker |
| Rich text     | TipTap                                                                          |
| File uploads  | UploadThing                                                                     |
| AI            | Vercel AI SDK + OpenRouter                                                      |
| Security      | Arcjet (rate limiting, bot detection, shield, sensitive-info detection)         |

## Architecture at a glance

```
app/
├─ (dashboard)/workspace/[workspaceId]/         # authenticated app shell
│  ├─ channel/[channelId]/                      # channel view, message list, composer
│  │  └─ _components/
│  │     ├─ message/                            # message list, composer, input form
│  │     ├─ thread/                              # thread sidebar, replies, AI summary
│  │     ├─ reaction/                            # emoji reactions bar + picker
│  │     └─ member/                              # members popover
│  └─ _components/                              # workspace-level chrome (sidebar, members)
├─ router/                                       # oRPC procedure definitions (business logic)
├─ middlewares/                                  # auth, workspace, and Arcjet security middleware
├─ schemas/                                      # Zod schemas shared by the API and realtime layer
└─ rpc/[[...rest]]/route.ts                      # single Next.js route that serves all oRPC calls

providers/            # React context providers for channel/thread realtime sockets
realtime/             # PartyKit server (the WebSocket relay), deployed separately
lib/                  # Prisma client, oRPC client, avatar/markdown helpers, reaction utilities
prisma/               # schema + migrations
```

**Request flow:** the client calls a typed oRPC procedure → it passes through `requiredAuthMiddleware` (Kinde session), `requiredWorkspaceMiddleware` (Kinde organization), and one or more Arcjet middlewares (`standard`, `read`, `write`, `heavy-write`, `reaction`, or `ai`, depending on the route) → the handler talks to Prisma → the response returns to the caller _and_, where relevant, the caller broadcasts a compact event over the appropriate PartyKit room so every other open client updates without a refetch.

**Real-time model:** each channel and each open thread gets its own WebSocket room (`channel-<id>`, `thread-<id>`). Events are intentionally small and viewer-agnostic (e.g. a reaction event carries _who_ toggled _which_ emoji and whether it was added or removed, never a pre-computed per-viewer snapshot) so every connected client can derive its own correct local state.

## Prerequisites

- Node.js 20+
- A PostgreSQL database
- A [Kinde](https://kinde.com/) application with **Organizations** enabled
- An [Arcjet](https://arcjet.com/) site key
- An [UploadThing](https://uploadthing.com/) app
- An [OpenRouter](https://openrouter.ai/) API key (or swap the model provider in `app/router/ai.ts`)
- A deployed PartyKit (Cloudflare Worker) instance for `realtime/index.ts`

## Environment variables

Create a `.env.local` in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/workflo"

# Kinde (see https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/ for the full list)
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/workspace
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000

# Arcjet
ARCJET_KEY=

# UploadThing (see https://docs.uploadthing.com/getting-started/appdir)
UPLOADTHING_TOKEN=

# AI (OpenRouter)
LLM_KEY=

# Real-time worker (PartyKit / Cloudflare Worker URL)
NEXT_PUBLIC_WORKER_URL=
```

> ⚠️ **Kinde token customization:** in your Kinde application settings, enable the **Organizations (array)** additional claim on the ID token (Settings → Applications → your app → Tokens → ID token → Configure). Without it, workspace names won't resolve and you'll see `organizations are not in ID token so names are missing` in your logs.

## Getting started

```bash
# install dependencies
pnpm install

# generate the Prisma client and run migrations
pnpm prisma migrate deploy
pnpm prisma generate

# start the dev server
pnpm dev
```

The app will be available at `http://localhost:3000`. You'll be redirected through Kinde to log in and land on `/workspace/<your-org-code>`.

Separately, deploy or run the real-time worker in `realtime/index.ts` (this is a PartyKit server, typically deployed to Cloudflare Workers) and point `NEXT_PUBLIC_WORKER_URL` at it.

> The exact scripts depend on your `package.json` (not included in this snapshot) — adjust the commands above if yours differ (e.g. a custom `db:migrate` script).

## Database

Schema lives in `prisma/schema.prisma` with three core models:

- **Channel** — belongs to a workspace (Kinde org code)
- **Message** — belongs to a channel; a `threadId` self-reference turns a message into a thread reply
- **MessageReaction** — one row per `(messageId, userId, emoji)`, enforced by a unique constraint, so each user can react with a given emoji at most once

To add a migration after changing the schema:

```bash
pnpm prisma migrate dev --name <description>
```

## Security middleware

Every write-capable oRPC route composes one or more Arcjet middlewares from `app/middlewares/arcjet/`:

| Middleware    | Used by                         | Limit                                                                                    |
| ------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| `standard`    | most routes                     | bot detection + shield (WAF)                                                             |
| `read`        | list/get endpoints              | 180 req/min                                                                              |
| `write`       | message create/update           | 40 req/min + sensitive-info scan                                                         |
| `heavy-write` | member invite, workspace create | 2 req/min + sensitive-info scan                                                          |
| `reaction`    | reaction toggle                 | 120 req/min (deliberately separate from `write` — reactions are frequent, low-risk taps) |
| `ai`          | AI compose/summarize            | 3 req/min + bot detection + sensitive-info scan                                          |

All limits are tracked per authenticated `userId`, not per IP — a bot running multiple accounts would need an additional IP-scoped rule layered on top if that's a concern for your deployment.

## Known limitations

- Presence, typing indicators, and reactions rely entirely on the PartyKit worker being reachable; if it's down, the REST/RPC layer still works but nothing updates live until a manual refetch.
- The AI features call OpenRouter directly from the server; check `app/router/ai.ts` if you want to swap providers or models.
- pnpm scripts and CI/deployment config aren't included in this snapshot — fill in `package.json`, hosting, and worker deployment details for your environment.
