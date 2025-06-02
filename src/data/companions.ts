export type Companion = {
  slug: string;
  title: string;
  glyph: string;
  essence: string;
  access: 'Public' | 'Invite Only' | 'Semi-Invite' | 'Gated' | 'Internal' | 'Ritual Access';
  summoning?: string[];
  origin?: string;
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
    title: 'The Builder',
    glyph: '🛠️',
    essence: 'Shapes frontend ritual terrain, slow and soft.',
    access: 'Internal'
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
