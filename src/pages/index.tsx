// src/pages/index.tsx
// Kora Intelligence homepage — full redesign
// Two products. One brand. AI that knows your business.
import Head from 'next/head';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ---------------------------------------------------------------------------
// Shared animation variants
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ---------------------------------------------------------------------------
// Count-up hook — triggers when element enters viewport
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 1400, inView = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setCount(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return count;
}

// ---------------------------------------------------------------------------
// Hero — data transformation
// ---------------------------------------------------------------------------
const DATA_FRAGMENTS = [
  { text: '"Refund on drop #4 — where do I submit?"', delay: 0 },
  { text: 'SKU: TRZ-091 | Stock: 12 | Sold: 0 in 14d', delay: 0.15 },
  { text: 'Customer #4421 — 3 orders, 2 returns', delay: 0.3 },
  { text: '"Is the blue one still available?"', delay: 0.45 },
  { text: 'Tuesday CTR: 1.2% vs Mon 3.8%', delay: 0.6 },
];

const INSIGHT_CARDS = [
  { label: 'Customer pattern', value: 'Tuesday queries up 40% — refund policy is top friction', trend: 'up' },
  { label: 'Product signal', value: 'SKU TRZ-091 underperforming — 0 conversions in 14 days', trend: 'down' },
  { label: 'Action recommended', value: 'Promote drops under £12 — 42% of buyers prefer that range', trend: 'up' },
];

function HeroAnimation() {
  return (
    <div className="relative w-full h-72 sm:h-80 select-none overflow-hidden">
      {/* Raw data fragments — left */}
      <div className="absolute left-0 top-0 bottom-0 w-[44%] flex flex-col justify-center gap-2.5 pr-2">
        {DATA_FRAGMENTS.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: [0, 0.55, 0.35], x: ['-8px', '0px', '4px'] }}
            transition={{
              duration: 3.2,
              delay: f.delay,
              repeat: Infinity,
              repeatDelay: 2.8,
              ease: 'easeInOut',
            }}
            className="text-[10px] sm:text-[11px] text-white/40 font-mono bg-white/[0.04] border border-white/8 rounded-lg px-3 py-2 leading-snug truncate"
          >
            {f.text}
          </motion.div>
        ))}
      </div>

      {/* Centre — Kora mark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            boxShadow: [
              '0 0 0 0px rgba(245,158,11,0)',
              '0 0 0 16px rgba(245,158,11,0.06)',
              '0 0 0 0px rgba(245,158,11,0)',
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center"
        >
          <div className="w-7 h-7 rounded-full bg-amber-500/80" />
        </motion.div>
        <p className="text-center text-[9px] font-semibold tracking-widest uppercase text-amber-500/60 mt-2">
          Kora
        </p>
      </div>

      {/* Insight cards — right */}
      <div className="absolute right-0 top-0 bottom-0 w-[44%] flex flex-col justify-center gap-2.5 pl-2">
        {INSIGHT_CARDS.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 + i * 0.18, ease: 'easeOut' }}
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2"
          >
            <p className="text-[9px] font-semibold tracking-wider uppercase text-amber-500/70 mb-0.5">
              {card.label}
            </p>
            <p className="text-[10px] sm:text-[11px] text-white/70 leading-snug">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Converging lines — subtle */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 280"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 176 140 Q 200 140 224 140"
          stroke="rgba(245,158,11,0.12)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Archetype card
// ---------------------------------------------------------------------------
type ArchetypeCardProps = {
  name: string;
  role: string;
  description: string;
  proof?: string;
  color: 'amber' | 'teal' | 'violet';
  delay?: number;
};

const colorMap = {
  amber: {
    glow: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(245,158,11,0.14) 0%, transparent 70%)',
    border: 'hover:border-amber-500/40',
    label: 'text-amber-400',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  teal: {
    glow: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(20,184,166,0.14) 0%, transparent 70%)',
    border: 'hover:border-teal-500/40',
    label: 'text-teal-400',
    dot: 'bg-teal-500',
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  violet: {
    glow: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,92,246,0.14) 0%, transparent 70%)',
    border: 'hover:border-violet-500/40',
    label: 'text-violet-400',
    dot: 'bg-violet-500',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
};

function ArchetypeCard({ name, role, description, proof, color, delay = 0 }: ArchetypeCardProps) {
  const c = colorMap[color];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden p-6 transition-colors duration-200 ${c.border}`}
    >
      {/* Bottom glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: c.glow }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className={`text-[11px] font-semibold tracking-wider uppercase ${c.label}`}>
            {name}
          </span>
        </div>

        <h3 className="text-[15px] font-semibold text-white mb-2 leading-snug">{role}</h3>
        <p className="text-[13px] text-white/50 leading-relaxed mb-4">{description}</p>

        {proof && (
          <span className={`inline-block text-[10px] font-medium px-2.5 py-1 rounded-full border ${c.badge}`}>
            {proof}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stats section
// ---------------------------------------------------------------------------
function Stat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useCountUp(target, 1500, inView);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-[12px] text-white/40 mt-1 leading-snug">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper with scroll reveal
// ---------------------------------------------------------------------------
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// How it works steps
// ---------------------------------------------------------------------------
const HOW_STEPS = [
  {
    n: '01',
    title: 'Connect your data',
    body: 'Upload files — PDF, Word, CSV, Excel, WhatsApp exports. Or connect Google Drive. We handle the rest.',
  },
  {
    n: '02',
    title: 'We configure the AI',
    body: 'Trained for the specific job. Not a template. Not a generic chatbot. An AI that knows your products, policies, and history.',
  },
  {
    n: '03',
    title: 'Deploy where you need it',
    body: 'Website widget. WhatsApp. Internal tool. Goes live in 48–72 hours from data handover.',
  },
  {
    n: '04',
    title: 'See what your business is doing',
    body: 'A dashboard with real business intelligence — and an AI analyst you can interrogate about the data.',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Home() {
  return (
    <>
      <Head>
        <title>Kora Intelligence — AI that knows your business</title>
        <meta
          name="description"
          content="Kora builds AI trained on your data — your products, customers, history. Deploy as a widget, WhatsApp integration, or internal tool. Real business intelligence, not generic AI."
        />
        <meta property="og:title" content="Kora Intelligence — AI that knows your business" />
        <meta
          property="og:description"
          content="Not AI that guesses. AI trained on your own data, deployed for your business."
        />
        <meta property="og:image" content="/og-default.png" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="bg-[#0a0a0a] text-white overflow-x-hidden">
        <Header />

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-28 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <p className="text-[11px] font-semibold tracking-widest uppercase text-amber-500 mb-5">
                Kora Intelligence
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.12] tracking-tight text-white mb-5">
                AI that knows<br />your business.<br />
                <span className="text-white/35">Not AI that guesses.</span>
              </h1>
              <p className="text-[15px] sm:text-[16px] text-white/55 leading-relaxed mb-8 max-w-lg">
                Most AI is built for everyone. That means it&apos;s optimised for no one.
                Kora builds AI trained on <em className="not-italic text-white/80">your</em> data — your products,
                your customers, your history — and deploys it in your business.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/build"
                  className="px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-[13px] font-semibold transition-colors duration-150"
                >
                  Talk to us about your business →
                </Link>
                <Link
                  href="/mvp"
                  className="px-7 py-3 rounded-full border border-white/10 hover:border-white/25 text-white/60 hover:text-white text-[13px] font-medium transition-colors duration-150"
                >
                  Try free as a founder
                </Link>
              </div>
            </motion.div>

            {/* Right — animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <HeroAnimation />
            </motion.div>
          </div>
        </section>

        {/* ── Proof — tova ─────────────────────────────────────────── */}
        <Section className="max-w-6xl mx-auto px-6 py-16">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-4">
              Built in production
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 leading-snug">
                  We proved the model on tova.
                </h2>
                <p className="text-[14px] text-white/50 leading-relaxed mb-4">
                  tova is a live drop marketplace in Karachi. Three AI features, all built by Kora
                  Intelligence, all running in production.
                </p>
                <a
                  href="https://tova.global"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Visit tova.global
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { name: 'Salar', desc: 'Customer support AI — trained on tova\'s policies. Handles all tier-1 support.', live: true },
                  { name: 'Lyra', desc: 'Drop description writer — trained on each merchant\'s history. Live for every seller.', live: true },
                  { name: 'Noor', desc: 'Consumer personalisation — learning individual taste across drops.', live: false },
                ].map(({ name, desc, live }) => (
                  <div key={name} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${live ? 'bg-teal-500' : 'bg-white/20'}`} />
                    <div>
                      <span className="text-[12px] font-semibold text-white/80">{name}</span>
                      {live && <span className="ml-2 text-[9px] font-medium text-teal-400 uppercase tracking-wider">Live</span>}
                      <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Three archetypes ─────────────────────────────────────── */}
        <Section className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">
            What Kora builds
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-10">
            Three types of job. One platform.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ArchetypeCard
              name="Salar"
              color="amber"
              role="Customer Intelligence"
              description="Handles tier-1 support via widget or WhatsApp. Trained on your catalogue, policies, and support history."
              proof="Live on tova.global"
              delay={0}
            />
            <ArchetypeCard
              name="Lyra"
              color="teal"
              role="Operational Intelligence"
              description="Reads your business data. Surfaces what's working, what isn't, what to act on. Writes grounded content."
              proof="Live on tova.global"
              delay={0.1}
            />
            <ArchetypeCard
              name="Noor"
              color="violet"
              role="Personalisation Intelligence"
              description="Learns individual customer behaviour. Helps your business understand and communicate personally with each customer."
              proof="In development"
              delay={0.2}
            />
          </div>
        </Section>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <Section className="max-w-6xl mx-auto px-6 py-12">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-10">
            <div className="grid grid-cols-3 gap-6 sm:gap-8">
              <Stat target={2400} suffix="+" label="customer queries handled on tova" />
              <Stat target={48} suffix="h" label="average time from data to live AI" />
              <Stat target={3} suffix="" label="AI archetypes, one platform" />
            </div>
          </div>
        </Section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <Section className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">
            The process
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-10">
            You bring the data. We build the AI.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map(({ n, title, body }, i) => (
              <motion.div
                key={n}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <p className="text-3xl font-bold text-white/[0.07] mb-3 tabular-nums">{n}</p>
                <h3 className="text-[14px] font-semibold text-white mb-2">{title}</h3>
                <p className="text-[12px] text-white/45 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── Pricing teaser ───────────────────────────────────────── */}
        <Section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">
              Pricing
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Simple pricing. No setup fees.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { tier: 'Starter', price: '£49', pkr: 'PKR 15,000', desc: '1 archetype · 500 conversations/mo · Widget embed' },
              { tier: 'Growth', price: '£149', pkr: 'PKR 42,000', desc: '2 archetypes · 2,500 conversations · WhatsApp + analyst', highlight: true },
              { tier: 'Scale', price: '£349', pkr: 'PKR 110,000', desc: 'All 3 archetypes · Unlimited · Live data connectors' },
            ].map(({ tier, price, pkr, desc, highlight }) => (
              <div
                key={tier}
                className={`rounded-2xl border p-6 ${
                  highlight
                    ? 'border-amber-500/30 bg-amber-500/[0.04]'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                {highlight && (
                  <span className="text-[9px] font-semibold tracking-widest uppercase text-amber-400 mb-3 block">
                    Most popular
                  </span>
                )}
                <p className="text-xl font-bold text-white mb-0.5">{price}<span className="text-[13px] font-normal text-white/40">/mo</span></p>
                <p className="text-[10px] text-white/25 mb-3">{pkr}/mo</p>
                <p className="text-[11px] font-semibold text-white mb-1">{tier}</p>
                <p className="text-[11px] text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/pricing"
              className="text-[12px] text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              See full pricing breakdown →
            </Link>
          </div>
        </Section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <Section className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-10 sm:p-14 text-center">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-amber-500/70 mb-4">
              Early access open
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Ready to talk?
            </h2>
            <p className="text-[14px] text-white/50 max-w-md mx-auto mb-8 leading-relaxed">
              Early conversations open for businesses in Pakistan and the UK.
              We&apos;ll read what you write and reply personally.
            </p>
            <Link
              href="/build"
              className="inline-block px-10 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-[14px] font-semibold transition-colors duration-150"
            >
              Tell us about your business →
            </Link>
          </div>
        </Section>

        {/* ── Kora for Founders strip ───────────────────────────────── */}
        <Section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-white/25 mb-2">
                Kora for Founders
              </p>
              <h3 className="text-[16px] font-semibold text-white mb-1">
                Personal AI for individual founders.
              </h3>
              <p className="text-[13px] text-white/45 leading-relaxed max-w-md">
                Salar and Lyra as expert advisors — proposals, contracts, campaigns, pricing strategy.
                No data required. Free to start.
              </p>
            </div>
            <Link
              href="/mvp"
              className="flex-shrink-0 px-7 py-2.5 rounded-full border border-white/15 hover:border-white/30 text-white/60 hover:text-white text-[13px] font-medium transition-colors duration-150"
            >
              Try now →
            </Link>
          </div>
        </Section>

        <Footer />
      </div>
    </>
  );
}
