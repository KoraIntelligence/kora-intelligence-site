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
  // [All companion entries go here, updated cleanly and correctly]
};

export const companionSlugs = Object.keys(companions);
