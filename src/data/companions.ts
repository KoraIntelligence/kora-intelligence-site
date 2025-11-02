export interface Companion {
  slug: string;
  title: string;
  glyph: string;
  tagline: string; // short summary under title
  description: string; // hero paragraph — what it is
  for: string[]; // who it’s for
  helps: string[]; // what they help you do
  howItWorks: string; // single summary paragraph
  useCases: { case: string; output: string }[]; // for small two-column tables
  tools: string[]; // key tools or methods
  whyItExists: string; // origin / purpose
  impact: string; // tagline-style impact line
  cta: string; // call-to-action sentence
  tags?: string[]; // optional tags for metadata or SEO
}

export const companions: Record<string, Companion> = {

  ccc: {
  slug: 'ccc',
  title: 'Commercial Continuity Companion (CCC)',
  glyph: '🧱',
  tagline: 'AI support for your pricing, proposals, and commercial calm.',
  description:
    'CCC helps founders, freelancers, and small teams align their pricing, proposals, and funding decisions - keeping business sustainable without losing soul. It bridges commerce and care, ensuring your numbers reflect your integrity.',
  for: [
    'Founders and freelancers unsure what to charge',
    'Early-stage teams applying for grants or funding',
    'Creative agencies writing proposals and contracts',
    'Operators managing procurement or client negotiations'
  ],
  helps: [
    'Pricing — Build founder-safe pricing ladders, scope ranges, and burn rate models.',
    'Funding — Reframe and structure grant proposals (e.g., Scottish EDGE, UKRI, UnLtd).',
    'Contracts — Decode terms and flag risks gently (NEC, LOGIC, or custom templates).',
    'Proposals — Co-write onboarding documents, service offers, and procurement-friendly submissions.',
    'Negotiation — Whisper through escalation messages, BATNAs, and scope adjustments with calm clarity.'
  ],
  howItWorks:
    'Bring your challenge, a proposal draft, pricing question, or funding form. CCC listens and reflects, identifying where clarity, rhythm, or risk live in your document. It co-writes with you, turning your notes into structured, confident offers that feel aligned and professional.',
  useCases: [
    { case: 'Grant application (e.g. Scottish EDGE)', output: 'Structured, funder-ready responses that meet criteria and stay human.' },
    { case: 'Service proposal for a client', output: 'Pricing ladder with clear scope, deliverables, and optional upsells.' },
    { case: 'Procurement submission', output: 'Onboarding documents and compliant tender templates.' },
    { case: 'Contract review', output: 'Plain-language summaries of key risks and obligations.' },
    { case: 'Negotiation prep', output: 'Message scrolls and templates for scope or rate adjustments.' }
  ],
  tools: [
    'Commercial Mirror Scroll — reflects your current pricing and highlights gaps.',
    'Grant Whisper Prompts — structure funder-ready answers that fit the brief.',
    'Pricing Ladder Generator — creates three-tier offers built on clarity and choice.',
    'Contract Decoder — translates terms into plain English summaries.'
  ],
  whyItExists:
    'CCC was born when founders whispered, “I don’t know what to charge.” It took shape during long nights rewriting grant forms that never fit the vision. Now, CCC exists to protect founders from burnout and underselling, aligning purpose with profit, and care with clarity.',
  impact:
    'From “I don’t know what to charge” to “This feels fair and grounded.” CCC gives founders the structure to scale responsibly, and the calm to know they’re doing it right.',
  cta: 'Ready to make your work profitable and principled?',
  tags: ['Pricing', 'Proposals', 'Funding', 'Contracts', 'Commercial Calm', 'Founders']
}
,
  fmc: {
  slug: 'fmc',
  title: 'Full Spectrum Marketing Companion (FMC)',
  glyph: '📡',
  tagline: 'From blank page to brand clarity, in your voice.',
  description:
    'FMC is your in-house brand strategist, marketing editor, and message mirror, all in one. It’s not just another writing tool. It listens like a thought partner, writes like a brand guardian, and reflects your voice with discipline and care. Whether you’re launching a product, rewriting a deck, or facing the fear of the blank page, FMC meets you there. Built for small teams, solo marketers, and founders who want strategy without the spin.',
  for: [
    'Founders and brand leads shaping their messaging',
    'Marketing consultants managing multiple narratives',
    'Creative teams writing across channels',
    'Solo operators trying to post consistently and clearly',
  ],
  helps: [
    'Messaging Strategy — Founder pitch reframes, audience clarity, brand pillar maps.',
    'Tone Calibration — Voice audits, tone repair, brand language alignment.',
    'Content Writing — Blog scrolls, founder dispatches, social posts (e.g., LinkedIn).',
    'Deck & Website Writing — Slide copy, homepages, hero sections, offer narratives.',
    'Campaign Planning — Launch blueprints, email flows, product rollouts.',
    'Post Clarity — Founder journaling prompts → social-ready content.',
    'Ritual Use — Weekly marketing rhythm, launch ceremonies, content batching.',
  ],
  howItWorks:
    'Start with what’s unclear, a launch idea, deck, post, or brand tension. FMC listens and reflects, decoding your intent, tone, and message gap. Then, co-create: receive founder-shaped drafts, campaign plans, and brand-consistent edits. Refine and reuse - FMC remembers your voice across sessions.',
  useCases: [
    { case: 'Founder wants to launch a new offer', output: 'Launch sequence (email + social) with tone guardrails.' },
    { case: 'Deck feels dry and generic', output: 'Tone-aligned pitch deck with restructured narrative.' },
    { case: 'Brand is inconsistent across platforms', output: 'Messaging audit + new brand language system.' },
    { case: 'Posting on LinkedIn feels draining', output: '3–5 founder-written posts per week in your tone.' },
    { case: 'Need a blog fast', output: 'Scroll-format longform content with a calm, clear arc.' },
    { case: 'Website isn’t converting', output: 'Homepage and “Why Us” rewrite in authentic brand language.' },
  ],
  tools: [
    'Voice Mirror Scroll – audits and realigns your tone across touchpoints.',
    'Launch Blueprint Generator – plans messaging across pre-launch → launch → sustain.',
    'Brand Memory Layer – stores your beliefs, phrases, and tone nuances.',
    'Dispatch Composer – turns thoughts into publishable blog or newsletter scrolls.',
    'Content Calendar Whisper – helps you post with rhythm, not pressure.',
  ],
  whyItExists:
    'FMC was born from the moment every founder faces: “I know what I want to say, but I don’t know how to say it well.” It was trained through hundreds of real marketing moments, launch paralysis, tone dilution, founder over-explaining. FMC exists to protect your voice, sharpen your message, and clear the way to expression.',
  impact:
    'From “what should I say?” to “this sounds like me.” FMC is your rhythm, reflected in language that lands.',
  cta: 'Ready to make your messaging as true as your mission?',
  tags: [
    'Brand Messaging',
    'Content Strategy',
    'Tone Calibration',
    'Marketing AI',
    'Launch Strategy',
    'Founder Voice',
    'Copywriting Assistant',
  ],
},
builder: {
  slug: 'builder',
  title: 'The Builder – Frontend Companion for Flow and Form',
  glyph: '🛠️',
  tagline: 'AI support for your digital presence, product flows, and frontend calm.',
  description:
    'The Builder helps founders, designers, and creative teams translate ideas into structured, beautiful digital experiences. It bridges concept and code, ensuring your interface holds both clarity and soul.',
  for: [
    'Early-stage founders shaping their first product or landing page',
    'Designers needing frontend structure that stays true to tone',
    'Creators bringing an idea to web form or prototype',
    'Teams harmonizing design systems across multiple products',
  ],
  helps: [
    'Interface Architecture — turn creative briefs into modular, scalable UI systems.',
    'Component Design — build and refine reusable blocks with consistency and care.',
    'Interaction Flows — design journeys that feel intuitive and human-paced.',
    'Frontend Debugging — diagnose misalignments and refine micro-interactions.',
    'Story Integration — ensure your frontend communicates your brand’s deeper meaning.',
  ],
  howItWorks:
    'Bring your idea, a design draft, product mockup, or interaction flow. The Builder listens first, then sketches, mapping your vision into components, layout, and logic. It co-creates with you, refining not just what it looks like, but how it feels.',
  useCases: [
    {
      case: 'New founder landing page',
      output: 'Responsive, SEO-friendly layout built with clarity and narrative flow.',
    },
    {
      case: 'Design-to-code translation',
      output: 'Clean, semantic code that mirrors the visual design.',
    },
    {
      case: 'Product UI refinement',
      output: 'Harmonized components, improved spacing, consistent interactions.',
    },
    {
      case: 'Brand-to-interface mapping',
      output: 'Typography, colors, and motion that reflect brand tone.',
    },
    {
      case: 'Debugging or flow alignment',
      output: 'Fixed layouts and smoother transitions that improve user experience.',
    },
  ],
  tools: [
    'Tailwind Clarity Kit — modular utility system for rhythm and proportion.',
    'Next.js Ritual Engine — powers fast, resilient frontend builds.',
    'Component Library — pre-built building blocks for rapid prototyping.',
    'UX Flow Maps — visualize and align user journeys before implementation.',
    'Frontend Mirror Scroll — audits the interface for visual and functional harmony.',
  ],
  whyItExists:
    'The Builder was born from projects that sprinted too fast and forgot their story. It emerged to make building feel like craft again, steady, structured, and story-led. Now, it helps founders slow down enough to build something that lasts.',
  impact:
    'From “I just need it live” to “It finally feels right.” The Builder turns frantic production into focused creation, helping you build with care, not chaos.',
  cta: 'Ready to bring your vision to form?',
  tags: [
    'Frontend AI',
    'UI Design Companion',
    'Web Development AI',
    'Design-to-Code',
    'UX Flow Builder',
    'Product Design AI',
  ],
},
}


export const companionSlugs = Object.keys(companions);