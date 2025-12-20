export interface Companion {
  slug: string;
  title: string;
  glyph: string;
  tagline: string;
  description: string;
  for: string[];
  helps: string[];
  howItWorks: string;
  useCases: { case: string; output: string }[];
  tools: string[];
  whyItExists: string;
  impact: string;
  cta: string;
  tags?: string[];
}

export const companions: Record<string, Companion> = {
  salar: {
    slug: 'salar',
    title: 'Salar',
    glyph: '🧱',
    tagline: 'Commercial clarity for proposals, pricing, and contracts.',
    description:
      'Salar is an AI-powered commercial companion designed to help individuals and teams handle proposals, pricing, contracts, and commercial decision-making with confidence. It combines structured workflows with freeform commercial chat, making it suitable from early-career professionals through to C-level leaders.',
    for: [
      'Founders and SME operators managing proposals or client negotiations',
      'Consultants and agencies responding to RFQs or tenders',
      'Commercial, procurement, or finance professionals',
      'Teams needing clear pricing, contract insight, or commercial sense-checking',
    ],
    helps: [
      'Proposal Builder — Analyse RFQs and generate structured, client-ready proposals.',
      'Contract Advisor — Review contracts, flag risks, and suggest plain-English redlines.',
      'Pricing & Estimation — Build pricing models and produce editable cost sheets.',
      'Commercial Strategy Chat — Sense-check decisions, negotiate scope, and explore options in freeform chat.',
    ],
    howItWorks:
      'Start by uploading a document or describing your commercial challenge. Salar asks targeted clarification questions, then guides you through structured workflows or open commercial discussion. Outputs are generated as usable documents that can be refined until ready.',
    useCases: [
      {
        case: 'Responding to an RFQ or tender',
        output: 'Structured proposal draft (DOCX/PDF) aligned to requirements.',
      },
      {
        case: 'Reviewing a client or supplier contract',
        output: 'Risk summary and suggested amendments in plain language.',
      },
      {
        case: 'Preparing pricing for a new engagement',
        output: 'Editable pricing model (XLSX) with clear assumptions.',
      },
      {
        case: 'Commercial decision-making',
        output: 'Freeform advisory guidance to support negotiation or strategy.',
      },
    ],
    tools: [
      'Guided Proposal Workflow',
      'Contract Risk Analysis',
      'Pricing & Estimation Sheets',
      'Freeform Commercial Chat',
    ],
    whyItExists:
      'Salar exists because commercial work is often high-stakes, repetitive, and stressful. Many teams lack dedicated commercial support. Salar provides structured, calm assistance so users can make informed decisions without losing time or confidence.',
    impact:
      'From uncertainty to clarity — Salar helps teams move forward with commercially sound decisions.',
    cta: 'Try Salar to bring clarity to your next commercial decision.',
    tags: [
      'Proposals',
      'Pricing',
      'Contracts',
      'Commercial Strategy',
      'SMEs',
      'Consulting',
    ],
  },

  lyra: {
    slug: 'lyra',
    title: 'Lyra',
    glyph: '📡',
    tagline: 'Clear messaging, campaigns, and outreach — built in your voice.',
    description:
      'Lyra is an AI-powered marketing and communications companion that helps teams develop messaging, plan campaigns, and execute outreach with consistency and clarity. It combines creative guidance with structured workflows, suitable from junior marketers to senior marketing leaders.',
    for: [
      'Founders and teams defining their messaging or positioning',
      'Marketers planning campaigns or content',
      'Consultants managing outreach and client communications',
      'Small teams without dedicated marketing resources',
    ],
    helps: [
      'Messaging Advisor — Clarify positioning, tone, and core messages.',
      'Campaign Builder — Plan campaigns with copy and visual direction.',
      'Lead Outreach — Segment leads and generate personalised outreach sequences.',
      'Customer Nurture — Create structured email nurture flows.',
    ],
    howItWorks:
      'Begin with an idea, brief, or dataset. Lyra asks clarifying questions, then guides you through messaging or campaign workflows. Outputs are refined collaboratively and delivered as ready-to-use copy or visual assets.',
    useCases: [
      {
        case: 'Defining brand or product messaging',
        output: 'Clear positioning statements and messaging frameworks.',
      },
      {
        case: 'Planning a product or campaign launch',
        output: 'Campaign plan with copy and visual guidance.',
      },
      {
        case: 'Outbound lead outreach',
        output: 'Personalised email sequences ready for CRM tools.',
      },
      {
        case: 'Customer retention and nurture',
        output: 'Multi-step email nurture flows with consistent tone.',
      },
    ],
    tools: [
      'Messaging & Positioning Frameworks',
      'Campaign Planning Workflows',
      'Outreach & Segmentation Logic',
      'Tone Memory & Consistency',
    ],
    whyItExists:
      'Lyra exists because marketing work often suffers from inconsistency, tool sprawl, and lack of time. Lyra helps teams move from ideas to execution without losing their voice or overcomplicating the process.',
    impact:
      'From scattered ideas to consistent communication — Lyra helps messages land.',
    cta: 'Try Lyra to turn ideas into clear, consistent communication.',
    tags: [
      'Marketing',
      'Messaging',
      'Campaigns',
      'Outreach',
      'Content Strategy',
    ],
  },
};

export const companionSlugs = Object.keys(companions);