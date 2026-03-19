# CLAUDE.md — Kora Intelligence

## What Kora Is

Kora Intelligence is a platform for deploying job-specific AI trained on your business's own data.

Businesses bring their data (customer interactions, product catalogues, support history, operational data). Kora ingests it, builds AI configured for a specific job (customer support, operational intelligence, personalisation), deploys it as a widget or WhatsApp integration, and surfaces business performance insights through a dashboard — not AI metrics, but actual business intelligence derived from the AI's analysis of the business's own data.

The dashboard comes with a conversational analyst: a chat panel where the business owner can ask questions about their data and get grounded answers. "Why is Tuesday underperforming?" "Which customers are at risk?" The AI has access to both the knowledge base and the live business snapshots.

**tova is the proof of concept.** Salar (customer support AI), Lyra (drop description writer), and Noor (personalisation AI, in development) are all live on tova.global — built using the same architecture Kora now offers to other businesses.

**Kora also has a companion product for individual founders** — the /mvp chat interface with Salar and Lyra. This remains live and is the entry point for individual users. No data upload required — personal productivity for proposals, contracts, campaigns.

---

## Two Products. One Brand.

### Kora for Founders (`/mvp`)
Personal productivity. Salar and Lyra as expert advisors. No data required.
- Salar: commercial intelligence (proposals, contracts, pricing, commercial strategy)
- Lyra: marketing intelligence (campaigns, messaging, outreach, brand voice)
- Entry point. Free or low-cost tier.

### Kora Platform (`/dashboard/[clientId]`)
Business deployment. Salar, Lyra, and Noor as named archetypes — each trained on a specific business's own data.

**Three AI archetypes:**
1. **Salar** — Customer Intelligence. Trained on your catalogue/policies, handles tier-1 customer support, deployed as widget or WhatsApp.
2. **Lyra** — Operational Intelligence. Trained on your performance data, surfaces business patterns, writes grounded content, recommends what to bring to market.
3. **Noor** — Personalisation Intelligence. Trained on customer behaviour, helps the business understand and communicate individually with each customer.

**Each archetype includes:**
- Business intelligence dashboard (visual, archetype-specific — shows business performance, not AI metrics)
- Conversational analyst chat panel (ask questions about your data, grounded in knowledge base + snapshots)
- Knowledge base management (upload files, connect Google Drive on Scale tier)

---

## Business Model

**Pricing:**
- Starter: £49/mo — 1 archetype, 500 conversations/mo, basic BI dashboard, website widget
- Growth: £149/mo — 2 archetypes, 2,500 conversations, full BI dashboard, WhatsApp, conversational analyst
- Scale: £349/mo — all 3 archetypes, unlimited conversations, live data connectors (Google Drive), dedicated support

**Pakistan pricing:**
- Starter: PKR 15,000/mo | Growth: PKR 42,000/mo | Scale: PKR 110,000/mo

**Employment model:** Local Kora Associates in each market — employees/contractors who onboard businesses, gather data, and interpret analytics. Not franchise. One company, local presence.

---

## Tech Stack

- **Framework:** Next.js (Pages Router — NOT App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion (already installed)
- **AI:** Anthropic Claude (`claude-sonnet-4-6`) — streaming SSE via `/api/unified-stream.ts`. Override via `KORA_MODEL` env var.
- **Embeddings:** OpenAI `text-embedding-3-small` (for knowledge base vectorisation)
- **Database:** Supabase Pro (auth + DB + pgvector + storage)
- **Hosting:** Vercel Pro
- **Repo:** github.com/KoraIntelligence/kora-intelligence-site

**npm install:** Always use `--legacy-peer-deps` (zod@4 in project vs zod@3 peer dep in openai@5).

---

## Site Structure

| Route | Purpose |
|-------|---------|
| `/` | Homepage — vision, two products, tova proof, pricing CTA |
| `/build` | Business enquiry page — "we're building this" + interest form |
| `/pricing` | Pricing page — three tiers, feature breakdown |
| `/mvp` | **Kora for Founders** — Salar/Lyra personal productivity (no data needed) |
| `/auth` | Authentication |
| `/account` | Business client account — knowledge base, archetype, dashboard link |
| `/dashboard/[clientId]` | BI dashboard + analyst chat — three views by archetype (Salar/Lyra/Noor) |
| `/widget/[clientId]` | Embeddable chat widget (iframe) |
| `/companions` | Companion explainer (keep) |
| ~~`/dispatches`~~ | **Disabled** — redirects to `/` via next.config.js |

---

## Companion Architecture (Kora for Founders — /mvp)

### Salar (Commercial)
Modes: `commercial_chat`, `proposal_builder`, `contract_advisor`, `pricing_estimation`, `commercial_strategist`
Orchestrator: `src/companions/orchestrators/salar.ts`

### Lyra (Marketing/Creative)
Modes: `creative_chat`, `messaging_advisor`, `campaign_builder`, `lead_outreach`, `customer_nurture`
Orchestrator: `src/companions/orchestrators/lyra.ts`

### Business Analyst (Platform Dashboard)
Orchestrator: `src/companions/orchestrators/analyst.ts`
- Takes client's question + fetches top-5 knowledge chunks + last 7 days of business_snapshots
- Returns grounded, data-specific answers
- Used in the right-panel chat on `/dashboard/[clientId]`

### Identity System (3-layer)
1. **Codex** — core persona (`src/companions/codex/`)
2. **Base** — companion-level identity (`src/companions/identity/`)
3. **Mode** — specific mode behaviour (`src/companions/prompts/`)

---

## Key Files

```
src/
  pages/
    index.tsx                  — Homepage (redesigned with Framer Motion animation)
    build.tsx                  — Business enquiry page + interest form
    pricing.tsx                — Pricing page (three tiers)
    mvp.tsx                    — Kora for Founders chat interface
    account.tsx                — Business client account home
    auth.tsx                   — Authentication
    dashboard/
      [clientId].tsx           — BI dashboard + analyst chat panel
    widget/
      [clientId].tsx           — Embeddable iframe chat widget
    api/
      unified-stream.ts        — Main streaming SSE endpoint (includes RAG if clientId present)
      build-enquiry.ts         — Saves enquiry form to build_enquiries table
      client/
        ingest.ts              — File → chunk → embed → store in knowledge_chunks
        analyst.ts             — Streaming SSE for dashboard analyst chat
      cron/
        analyse.ts             — Nightly business intelligence snapshot (Claude Haiku)
      whatsapp/
        webhook.ts             — Twilio inbound → unified-stream (Phase 2)
      google/
        connect.ts             — OAuth for Google Drive (Phase 2)
        sync.ts                — Sync Drive files into knowledge_chunks (Phase 2)
  companions/
    orchestrators/
      salar.ts                 — Commercial companion
      lyra.ts                  — Marketing companion
      analyst.ts               — Business analyst (dashboard chat)
    identity/                  — Base companion identity
    codex/                     — Core persona
    prompts/                   — 10 prompt packs (5 per companion)
    workflows/                 — Workflow stage definitions
  lib/
    memory.ts                  — tone memory + session memory + brand context
    supabaseAdmin.ts           — Server-side Supabase client
    retry.ts                   — Exponential backoff wrapper
```

---

## Database (Supabase)

### Live Tables
- `user_profiles` — id, name, email, current_tone
- `sessions` — id, user_id, companion_slug, context, title, mode, summary
- `messages` — id, session_id, role, content, attachments, metadata
- `tone_history` — tone preference tracking
- `promo_codes` — early access gating
- `brand_profiles` — user brand memory (brand_name, industry, tone_keywords, etc.)

### Platform Tables
- `business_clients` — id, user_id, business_name, industry, archetype (`salar`|`lyra`|`noor`)
- `knowledge_chunks` — id, client_id, content, embedding (vector 1536), source_file
- `business_snapshots` — id, client_id, snapshot_date, headline, insights (jsonb `{title,detail,trend,action}[]`), data_coverage_pct
- `analyst_sessions` — id, client_id, messages (jsonb), created_at
- `build_enquiries` — id, business_name, industry, city, job_description, has_data, email
- `subscriptions` — id, client_id, stripe_customer_id, tier, status, current_period_end
- `google_connections` — id, user_id, client_id, access_token, refresh_token, token_expiry (Phase 2)

### pgvector
Enable: `create extension if not exists vector;`
Index: `create index on knowledge_chunks using ivfflat (embedding vector_cosine_ops);`

---

## Key Rules & Conventions

1. **Pages Router only** — NOT App Router. No `app/` directory, no server components, no `use client` in page files.
2. **Streaming responses** — all AI via SSE. No blocking awaits on completions.
3. **RAG pattern** — if `clientId` in request body, query `knowledge_chunks` for top-5 matches and inject as `KNOWLEDGE BASE` block in system prompt before calling orchestrator.
4. **Analyst has snapshot context** — dashboard analyst chat injects last 7 days of `business_snapshots.insights` as `BUSINESS INTELLIGENCE` block before user question.
5. **Dashboard = business intelligence** — show how the BUSINESS is performing, as analysed by the AI. Never show AI performance metrics (query counts, token usage, response times) to business clients.
6. **Cron produces, dashboard consumes** — analytics are pre-computed by the nightly cron (`/api/cron/analyse.ts`). Dashboard renders from `business_snapshots`. No real-time AI calls on dashboard page load.
7. **TypeScript strict** — no `any`, full types.
8. **npm install** — always `--legacy-peer-deps`.
9. **Dispatches disabled** — `/dispatches` redirects to `/` via `next.config.js`.
10. **Business snapshots insight shape:**
    ```typescript
    interface Insight {
      title: string;    // short label
      detail: string;   // specific, data-grounded explanation
      trend: 'up' | 'down' | 'flat';
      action: string;   // one recommended action
    }
    ```

---

## Google Drive Connector (Phase 2 — Scale tier)

1. `/api/google/connect` → OAuth consent screen (scopes: `drive.readonly`, `spreadsheets.readonly`) → callback stores tokens in `google_connections`
2. `/api/google/sync` → lists Drive files → exports via Drive API → `parseUploadedFile()` → `ingest.ts` pipeline
3. Google Sheets: Sheets API → read as CSV → same chunking pipeline
4. Daily cron re-sync — detects `modifiedTime` changes, re-embeds changed files (replaces old chunks for that `source_file`)

---

## Build Priorities

**Week 1 (current):**
- [x] CLAUDE.md rewrite
- [ ] Disable `/dispatches`
- [ ] Supabase migrations (pgvector + all platform tables)
- [ ] `/api/client/ingest.ts` — file → chunks → embeddings → knowledge_chunks
- [ ] RAG retrieval block in `unified-stream.ts`
- [ ] `/build` page + `build_enquiries` table + `/api/build-enquiry.ts`
- [ ] Homepage redesign (`/`) with Framer Motion animation

**Week 2:**
- [ ] `/api/cron/analyse.ts` + `vercel.json` cron config
- [ ] `/dashboard/[clientId].tsx` — three archetype BI views + analyst chat panel
- [ ] `src/companions/orchestrators/analyst.ts`
- [ ] `/api/client/analyst.ts` — streaming analyst endpoint

**Week 3:**
- [ ] `/account.tsx` — business account home
- [ ] `/widget/[clientId].tsx` — embeddable iframe
- [ ] `/pricing.tsx` — pricing page
- [ ] `subscriptions` table + Stripe webhook skeleton

**Week 4+:**
- [ ] Stripe billing (mirror tova implementation)
- [ ] WhatsApp webhook (port from tova Twilio code)
- [ ] Google Drive connector

---

## Verification Checklist

Before considering any feature done:
- [ ] Works on mobile (375px)
- [ ] Pages Router patterns only (no App Router syntax)
- [ ] TypeScript compiles clean (`npm run build`)
- [ ] `npm install --legacy-peer-deps` if adding dependencies
- [ ] Dashboard shows business insights, not AI metrics
- [ ] Analyst chat injects both knowledge chunks AND snapshot context
- [ ] Error state + loading state for all async operations
- [ ] No secrets committed (`.env.local` is gitignored)
