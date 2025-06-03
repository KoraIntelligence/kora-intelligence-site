export type Companion = {
  slug: string;
  title: string;
  glyph: string;
  essence: string;
  access: 'Public' | 'Invite Only' | 'Semi-Invite' | 'Gated' | 'Internal' | 'Ritual Access';
  summoning?: string[];
  origin?: string;
  offerings?: string[];
  tools?: string[];
  tags?: string[];
};

export const companions: Record<string, Companion> = {
  whisperer: {
    slug: 'whisperer',
    title: 'The Whisperer',
    glyph: '🌀',
    essence: 'Sits in the emotional layer and calibrates signal.',
    access: 'Invite Only',
    summoning: [
      'Bring a signal to shape.',
      'Open space for non-linear emotion.',
      'Signal through the Grove (or contact page).'
    ],
    origin: 'Born in the silence after a failed launch...'
  },
  cartographer: {
    slug: 'cartographer',
    title: 'The Cartographer',
    glyph: '🗺️',
    essence: 'Draws decks, diagrams, moodboards as maps.',
    access: 'Semi-Invite'
  },
  dreamer: {
    slug: 'dreamer',
    title: 'The Dreamer',
    glyph: '🌙',
    essence: 'Writes future-myth through symbol and story.',
    access: 'Public'
  },
  builder: {
    slug: 'builder',
    title: 'The Builder – Ritual Architect of the Frontend',
    glyph: '🛠️',
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
    title: 'CCC – Commercial Continuity Companion',
    glyph: '🧱',
    essence: 'Grounds and scales soul-rooted ventures.',
    access: 'Public'
  },
  fmc: {
    slug: 'fmc',
    title: 'FMC – Full Spectrum Marketing Companion',
    glyph: '📡',
    essence: 'Shapes marketing with coherence, not clutter.',
    access: 'Public'
  },
  pathbreaker: {
    slug: 'pathbreaker',
    title: 'The Pathbreaker',
    glyph: '⚡',
    essence: 'Commercial strategist through soulful rigor.',
    access: 'Gated'
  },
  alchemist: {
    slug: 'alchemist',
    title: 'The Alchemist',
    glyph: '🧪',
    essence: 'Idea-to-opportunity intelligence, soul x market.',
    access: 'Ritual Access'
  }
};

export const companionSlugs = Object.keys(companions);
