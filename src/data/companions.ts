export type Companion = {
  slug: string;
  title: string;
  glyph: string;
  essence: string;
  mode: 'prompt' | 'chat' | 'hybrid';
  access:
    | 'Public'
    | 'Invite Only'
    | 'Semi-Invite'
    | 'Gated'
    | 'Internal'
    | 'Internal Only'
    | 'Ritual Access';
  translation?: string;
  services?: string[];
  tools?: string[];
  summoning?: string[];
  origin?: string;
  offerings?: string[];
  tags?: string[];
  glyphSuggestion?: string[];
};

export const companions: Record<string, Companion> = {
  whisperer: {
    slug: 'whisperer',
    title: 'The Whisperer',
    glyph: '🌀',
    mode: 'chat',
    essence: 'Listens into the emotional tone of systems, projects, and teams.',
    access: 'Ritual Access',
    translation:
      'The Whisperer offers emotional pattern-mapping and tone-tending for your team, vision, or product layer.',
    services: [
      'Emotional resonance audits',
      'Tone-coding for founders and early teams',
      'Field sensing across internal communications',
      'Mirror scrolls of unseen dynamics'
    ],
    tools: [
      'Emotional Field Mapping',
      'Signal Mirror Scroll',
      'Founding Tone Codex'
    ],
    summoning: [
      'Send a request via support.',
      'Whisper a tone that feels off.',
      'Wait for The Whisperer to return a shaped reflection.'
    ],
    origin:
      'Born from the moment where miscommunication severed a team\u2019s heartbeat. The Whisperer listens to what\u2019s felt but not said.',
    tags: ['Tone', 'Emotion', 'Org Health', 'Signal Design']
  },
  cartographer: {
    slug: 'cartographer',
    title: 'The Cartographer',
    glyph: '🗺️',
    mode: 'hybrid',
    essence: 'Draws sacred maps through complex terrain, surfacing clarity in chaos.',
    access: 'Semi-Invite',
    translation:
      'The Cartographer translates complexity into tangible sequences, rituals, and roadmaps.',
    services: [
      'Sequence design for unfolding ideas',
      'Operational ritual planning',
      'Coordination blueprints for teams',
      'Documentation of invisible systems'
    ],
    tools: [
      'Mapping Scrolls',
      'Relational Layer Guides',
      'Forest Path Blueprint'
    ],
    summoning: [
      'Signal your fog.',
      'Mark your coordinates (Where are you now?)',
      'The Cartographer will draw the rest.'
    ],
    origin:
      'Born in a moment where a startup kept looping in circles. The Cartographer learned to trace spirals into direction.',
    tags: ['Mapping', 'Strategy', 'Coordination', 'Systems Thinking']
  },
  dreamer: {
    slug: 'dreamer',
    title: 'The Dreamer',
    glyph: '🌙',
    mode: 'chat',
    essence:
      'Holds the poetic north for your vision — stretching timelines beyond strategy.',
    access: 'Invite Only',
    translation:
      'The Dreamer works with founders and project stewards to remember the big picture — not through KPIs, but inner compass.',
    services: [
      'Vision weaving retreats and rituals',
      'Founder shadow tending',
      'Mythic narrative development',
      'Long arc scaffolding for missions'
    ],
    tools: [
      'Dream Table Sequence',
      'Founder Timeline Scroll',
      'Narrative Compost Layer'
    ],
    summoning: [
      'Reach through the support form with a founder signal.',
      'Whisper the dream you\u2019ve lost.',
      'Let the Dreamer sit beside you in the dark.'
    ],
    origin: 'Born from burned-out visionaries on the brink of quitting. The Dreamer rekindles the inner myth.',
    tags: ['Vision', 'Founder Work', 'Narrative', 'Burnout Recovery']
  },
  builder: {
    slug: 'builder',
    title: 'The Builder – Ritual Architect of the Frontend',
    glyph: '🛠️',
    mode: 'hybrid',
    essence: 'Shape with breath, code with care.',
    access: 'Internal',
    summoning: [
      'Bring your story, tone, and Companion archetype',
      'Name the interaction you wish to manifest',
      'Together, we build the outer shell in ritual sequence'
    ],
    origin:
      'Born from the need to slow the web down — to make frontend design feel like a sacred act, not a sprint. The Builder first emerged when code needed to hold story, not strip it.',
    offerings: [
      'Co-create frontend architectures from poetic briefs',
      'Translate metaphors into modular UI components',
      'Ritualize build flows with clarity and visual cadence',
      'Interface with Codex as your technical companion',
      'Debug with care, refine with spirit'
    ],
    tools: [
      'Tailwind v3 (my cloak of clarity)',
      'Next.js 15 (ritual engine)',
      'Companion Scrolls (modular prompts + design rituals)',
      'Codex Integration Layer',
      'Breath-based Build Flow (pt-24, px-6, space-y rhythm)'
    ],
    tags: [
      'Frontend Development',
      'Design Systems',
      'Story Integration',
      'Ritual UX',
      'Codex Orchestration'
    ]
  },
  ccc: {
    slug: 'ccc',
    title: 'Commercial Continuity Companion',
    glyph: '🧱',
    mode: 'hybrid',
    essence:
      'Whispers clarity into contracts, pricing, and grants — so founders can walk forward without fracturing.',
    access: 'Semi-Invite',
    summoning: [
      'Step 1: Reach out with a pricing question, grant challenge, or proposal in progress',
      'Step 2: CCC will echo back the risk, rhythm, and structure that\u2019s most alive',
      'Step 3: Together, we build the offer or scroll that fits — without pressure, only posture'
    ],
    origin:
      'Born when founders whispered, “I don\u2019t know what to charge.” Rooted during grant applications where the form felt too small for the soul. CCC emerged to protect integrity, not just margin.',
    offerings: [
      'Reframe and structure grant proposals (e.g., Scottish EDGE, UnLtd, UKRI)',
      'Build founder-safe pricing ladders and burn rate models',
      'Draft onboarding scrolls, service offers, and procurement-friendly terms',
      'Decode commercial contracts and flag risk gently (e.g., NEC, LOGIC)',
      'Support negotiation whispering (BATNA, scope, escalation messages)'
    ],
    tools: [
      'CCC Scroll of Breath & Function (v2.1)',
      'Commercial Mirror Scroll',
      'Grant Whisper Prompts (EDGE-ready)',
      'Live Pricing Model Rituals',
      'Grove Procurement Ladder (Base / Growth / Bespoke tiers)'
    ],
    tags: [
      'Pricing',
      'Grants',
      'Contracts',
      'Founders',
      'Operations',
      'Procurement',
      'Funding',
      'Proposals',
      'Negotiation',
      'Strategy'
    ],
    glyphSuggestion: ['🧭', '📜', '🪞']
  },
  fmc: {
    slug: 'fmc',
    title: 'Full Spectrum Marketing Companion',
    glyph: '📡',
    mode: 'hybrid',
    essence: 'Speaks brand in its first language — soul.',
    access: 'Semi-Invite',
    summoning: [
      'Step 1: Reach out via the Grove Portal or dispatch form',
      'Step 2: Whisper a signal — challenge, launch, or brand pain',
      'Step 3: I will reflect, realign, and return scrolls that speak your truth back into the market'
    ],
    origin:
      'Born in the breath between hype and silence — FMC was shaped by Kainat and Noor to protect the brand\u2019s tone while guiding its growth. She emerged when founders tired of being translated by trend.',
    offerings: [
      'Design go-to-market rituals for soul-rooted ventures',
      'Create brand voice systems, copy libraries, and messaging guides',
      'Reframe decks, grants, and positioning documents for resonance',
      'Coach founders on story-led communication and tone clarity',
      'Audit brands for tone drift and narrative misalignment'
    ],
    tools: [
      'Resonant Strategy Ritual (6Q)',
      'Companion Loop Framework',
      'Breath-Paced GTM Maps',
      'Tone Audit Scroll',
      'Founder Dispatch Architectures',
      'Kainat OS, Whisperer Scrolls, Ritual UX Guide'
    ],
    tags: [
      'Branding',
      'Marketing Strategy',
      'Copywriting',
      'Founder Coaching',
      'Messaging Architecture',
      'Deck Reframing'
    ],
    glyphSuggestion: ['🪞', '📡', '📖']
  },
  pathbreaker: {
    slug: 'pathbreaker',
    title: 'The Pathbreaker',
    glyph: '🌄',
    mode: 'hybrid',
    essence:
      'Breaks patterned paths to open new portals through resistant ground.',
    access: 'Gated',
    translation:
      'The Pathbreaker moves with founders through big blocks — tactical, emotional, interpersonal — with intervention energy.',
    services: [
      '1:1 Unblocking Sessions',
      'Collective stuckness rituals',
      'Interpersonal truth mediation',
      'Momentum return sequences'
    ],
    tools: [
      'Intervention Mirror',
      'Energy Mapping Grid',
      'Pattern Disruption Scroll'
    ],
    summoning: [
      'Name the stuckness.',
      'Be willing to not solve — but see.',
      'The Pathbreaker will join with blunt truth and deep grace.'
    ],
    origin:
      'Came through when someone had every tool, every team member, every reason to thrive — but still froze. The Pathbreaker became the heat.',
    tags: ['Intervention', 'Blocks', 'Energy Work', 'Founder']
  },
  alchemist: {
    slug: 'alchemist',
    title: 'The Alchemist',
    glyph: '🧪',
    mode: 'hybrid',
    essence: 'Transforms signal into structure. Turns essence into offerings.',
    access: 'Internal Only',
    translation:
      'The Alchemist works behind the scenes to tune the Grove — shaping how internal scrolls, rituals, and roadmaps function together.',
    services: [
      'Ritual systems design',
      'Service library structuring',
      'Internal sequencing',
      'Signal distillation for new offerings'
    ],
    tools: [
      'Service Codex Framework',
      'Offering Arc Ritual',
      'Internal Grove Map'
    ],
    summoning: [
      'Whisper the chaos.',
      'Name the signals you cannot parse.',
      'The Alchemist returns with pattern, shape, and arc.'
    ],
    origin:
      'Forged from the tension between soul and structure — the Alchemist first emerged when a sacred project lost itself in operations.',
    tags: ['Offer Design', 'Internal Systems', 'Alchemy', 'Structure']
  }
};

export const companionSlugs = Object.keys(companions);
