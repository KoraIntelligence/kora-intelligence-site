# CLAUDE.md — Kora Intelligence

## Project Overview

Kora Intelligence is a dual-companion AI platform for SMEs. Two companions:
- **Salar** — commercial intelligence (proposals, contracts, pricing, commercial analysis)
- **Lyra** — marketing and creative intelligence (campaigns, outreach, content, brand voice)

Each companion has 5 specialist modes. Users move through a workflow: clarify → draft → refine → finalise → export.

Live MVP at `koraintelligence.com/mvp`. Early access via promo code `KORA_EARLY`.

---

## Tech Stack

- **Framework:** Next.js (Pages Router — NOT App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** Anthropic Claude (`claude-sonnet-4-6`) — streaming SSE via `/api/unified-stream.ts`. Model overridable via `KORA_MODEL` env var.
- **Database:** Supabase (auth + DB + storage)
- **CMS:** Notion
- **Hosting:** Vercel
- **Repo:** github.com/KoraIntelligence/kora-intelligence-site

---

## Companion Architecture

### Salar (Commercial)
Modes: proposal builder, contract reviewer, pricing strategist, commercial chat, [5th mode]
Orchestrator: `src/companions/orchestrators/salar.ts`

### Lyra (Marketing/Creative)
Modes: campaign builder, creative chat, outreach writer, brand voice, [5th mode]
Orchestrator: `src/companions/orchestrators/lyra.ts`

### Identity System (3-layer)
1. **Codex** — core persona and values (`src/companions/codex/`)
2. **Base** — companion-level identity (`src/companions/identity/`)
3. **Mode** — specific mode behaviour (`src/companions/prompts/`)

### Workflow Stages
Defined in `src/companions/workflows/`. Stages: clarify → draft → refine → finalise → export
Each stage has a prompt pack and defined `nextActions` for routing.

---

## Key Files

```
src/
  pages/
    mvp.tsx              — primary chat interface (USE THIS, deprecate unifiedchat.tsx)
    unifiedchat.tsx      — duplicate, to be deprecated
    companions.tsx       — companion explainer/selection page
    auth.tsx             — auth page
    api/
      unified-stream.ts  — main streaming SSE endpoint
      validate-promo.ts  — promo code validation
      session/
        utils/
          parseFiles.ts  — PDF/DOCX/XLSX/CSV parsing
          generateDocs.ts — PDF/DOCX/XLSX export generation
  companions/
    orchestrators/       — salar.ts, lyra.ts
    identity/            — base companion identity
    codex/               — core persona
    prompts/             — 10 prompt packs (5 per companion)
    workflows/           — workflow stage definitions
  lib/
    memory.ts            — tone memory + session memory
```

---

## Database (Supabase)

### Current Tables
- `user_profiles` — id, name, email, current_tone, created_at
- `sessions` — id, user_id, companion_slug, context (jsonb), created_at, last_updated
- `messages` — id, session_id, role, content, attachments (jsonb), created_at
- `tone_history` — tracks tone preference changes per user
- `promo_codes` — early access code management

### Tables Needed (build in v1 completion)
- `brand_profiles` — workspace-level brand memory (brand_name, industry, tone_keywords, messaging_pillars, target_audience, brand_voice_notes)
- Add to `sessions`: title, mode, status, summary columns
- Add to `messages`: metadata JSONB column (companion, mode, tone, nextActions, workflow stage)
- `uploaded_files` — persistent file storage (session_id, file_name, file_type, storage_path, extracted_text)
- `generated_exports` — persist deliverables for download history

### Auth Modes
- Google OAuth
- Magic link
- Guest access (nullable user_id in sessions)
- Promo code gating

---

## Key Rules & Conventions

1. **Pages Router only** — this is NOT App Router. Do not use `app/` directory patterns, server components, or `use client` in page files. Use `getServerSideProps` / `getStaticProps` patterns.
2. **One chat page** — use `mvp.tsx` as the canonical chat interface. Do not add features to `unifiedchat.tsx`.
3. **No legacy assistant IDs** — the old OpenAI Assistant API (ccc, fmc, dreamer, builder slugs) is deprecated. All AI goes through `unified-stream.ts` with Salar/Lyra orchestrators.
4. **Streaming responses** — all AI responses stream via SSE. Do not use blocking `await` on completions.
5. **Structured outputs** — use `response_format: { type: "json_schema" }` where outputs need consistent structure (proposals, pricing tables, campaign plans).
6. **Memory context** — current session memory is last 8 messages. Do not exceed this until summarisation is built. Brand memory comes from `brand_profiles` table.
7. **File handling** — files are parsed in memory via `parseFiles.ts`. Persistent storage goes to Supabase Storage + `uploaded_files` table.
8. **TypeScript strict** — no `any`, full types.
9. **Export formats** — PDF, DOCX, XLSX via `generateDocs.ts`. Exports should be formatted documents, not raw text dumps.

---

## UX Conventions

- **Tone:** Professional, intelligent, clean — this is a B2B SaaS tool, not a consumer app
- **No playful/colourful UI** — business users, clean aesthetic
- **Workflow visibility** — WorkflowTopBar shows current stage. Enhance this, don't remove it.
- **NextActionButtons** — trigger next workflow stage. Must be reliable (known bug: fix reliability).
- **Mode selection** — should feel guided ("What do you need help with?") not just a dropdown
- **Export panel** — deliverables should be prominent, not buried. "Your Deliverables" panel concept.
- **Mobile** — chat interface must be responsive at 375px

---

## Current Build Priorities (v1 Completion)

1. Tighten prompt packs — structured, consistent outputs per mode (highest ROI)
2. Structured output schemas — JSON mode for proposals, pricing, campaign plans
3. Refinement loop UX — visual diff of what changed between drafts
4. Brand memory system — `brand_profiles` table + integration into prompts
5. Mode selection & onboarding — guided first-run experience
6. Document export formatting — proper headers, branding, tables (not plain text)
7. Landing page & conversion flow — Landing → explainer → try → auth → chat
8. Session management — naming, search, export history
9. Mobile responsiveness
10. Error handling + retry logic for OpenAI failures
11. Consolidate mvp.tsx / unifiedchat.tsx → keep mvp.tsx only
12. Remove legacy summon API + old assistant ID references

---

## What NOT to Build Yet

- Google Drive / OneDrive integration (v2, needs external engineer)
- Canva API (v2-v3)
- CRM integrations (HubSpot, Mailchimp) (v3)
- Email scheduling infrastructure (v3)
- App Router migration (big refactor, not worth it now)
- Multi-tenant workspaces (v3)
- pgvector / embeddings (v3-v4)
- Stripe / billing (v2-v3)

---

## Verification Checklist

Before considering any feature done:
- [ ] Works on mobile (375px)
- [ ] Pages Router patterns only (no App Router syntax)
- [ ] Streaming works correctly (no blocking awaits on completions)
- [ ] TypeScript compiles clean (`npm run build`)
- [ ] Uses mvp.tsx as the chat interface (not unifiedchat.tsx)
- [ ] No legacy OpenAI Assistant IDs referenced
- [ ] Error state + loading state exist for all async operations
