// src/pages/build.tsx
// Business enquiry page — honest "we're building this" + interest form
import Head from 'next/head';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const INDUSTRIES = [
  'Retail / E-commerce',
  'Food & Beverage',
  'Fashion & Apparel',
  'Professional Services',
  'Healthcare',
  'Education',
  'Hospitality',
  'Real Estate',
  'Technology',
  'Other',
];

const JOBS = [
  { key: 'customer_support', label: 'Customer support AI', description: 'Handle tier-1 queries via widget or WhatsApp' },
  { key: 'operational_intel', label: 'Operational intelligence', description: 'Surface patterns in your business data' },
  { key: 'personalisation', label: 'Customer personalisation', description: 'Understand and communicate with each customer individually' },
];

type FormState = {
  businessName: string;
  industry: string;
  city: string;
  selectedJobs: string[];
  hasData: boolean | null;
  email: string;
};

const initial: FormState = {
  businessName: '',
  industry: '',
  city: '',
  selectedJobs: [],
  hasData: null,
  email: '',
};

export default function BuildPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleJob = (key: string) => {
    setForm((prev) => ({
      ...prev,
      selectedJobs: prev.selectedJobs.includes(key)
        ? prev.selectedJobs.filter((j) => j !== key)
        : [...prev.selectedJobs, key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.businessName.trim()) return setError('Please enter your business name.');
    if (!form.email.trim()) return setError('Please enter your email.');

    setSubmitting(true);

    try {
      const res = await fetch('/api/build-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          industry: form.industry,
          city: form.city,
          jobDescription: form.selectedJobs.join(', '),
          hasData: form.hasData ?? false,
          email: form.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Build with Kora — Kora Intelligence</title>
        <meta
          name="description"
          content="Tell us about your business. We're building AI trained on your data — for your customers, your team, your operations."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-[#0a0a0a] text-white pt-20">

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="max-w-2xl mx-auto px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase text-amber-500 mb-4">
              Kora Intelligence — Early Access
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-white mb-5">
              We&apos;re building AI for your business.<br />
              <span className="text-white/50">Tell us what you need.</span>
            </h1>
            <p className="text-[15px] text-white/60 leading-relaxed max-w-xl">
              Kora builds AI trained on your own data — your products, your customers, your history.
              Not a generic chatbot. A business intelligence layer that knows your operation.
            </p>
          </motion.div>
        </section>

        {/* ── Honest context ───────────────────────────── */}
        <section className="max-w-2xl mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6"
          >
            <p className="text-[13px] font-semibold text-amber-400 mb-2">Where we are right now</p>
            <p className="text-[13px] text-white/55 leading-relaxed">
              Kora is in active development. We&apos;ve proven the model on{' '}
              <a
                href="https://tova.global"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
              >
                tova.global
              </a>
              {' '}— three AI features live in production — and we&apos;re now onboarding our first
              external businesses. If you submit this form, we&apos;ll be in touch personally. No
              automated pipeline, no sales call. Just a real conversation.
            </p>
          </motion.div>
        </section>

        {/* ── Form ─────────────────────────────────────── */}
        <section className="max-w-2xl mx-auto px-6 pb-24">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.05] p-10 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-5">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">We&apos;ve got your details.</h2>
                <p className="text-[13px] text-white/50 max-w-sm mx-auto leading-relaxed">
                  Someone from Kora will reach out within 48 hours. This isn&apos;t automated — it&apos;ll be a real person who has read what you wrote.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >

                {/* Business basics */}
                <div className="space-y-5">
                  <h2 className="text-[11px] font-semibold tracking-widest uppercase text-white/30">
                    Your Business
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Business name *"
                      value={form.businessName}
                      onChange={(v) => set('businessName', v)}
                      placeholder="e.g. Atlas Roastery"
                    />
                    <Field
                      label="City"
                      value={form.city}
                      onChange={(v) => set('city', v)}
                      placeholder="e.g. Karachi"
                    />
                  </div>

                  {/* Industry select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30">
                      Industry
                    </label>
                    <select
                      value={form.industry}
                      onChange={(e) => set('industry', e.target.value)}
                      className="w-full h-10 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 text-[13px] px-3
                                 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i} className="bg-[#1a1a1a]">{i}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* What job */}
                <div className="space-y-4">
                  <h2 className="text-[11px] font-semibold tracking-widest uppercase text-white/30">
                    What do you need AI for?
                  </h2>
                  <p className="text-[12px] text-white/40">Select all that apply.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {JOBS.map(({ key, label, description }) => {
                      const selected = form.selectedJobs.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleJob(key)}
                          className={`
                            text-left rounded-xl border px-4 py-3.5 transition-all duration-150
                            ${selected
                              ? 'border-amber-500/60 bg-amber-500/[0.08] text-white'
                              : 'border-white/8 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70'
                            }
                          `}
                        >
                          <p className="text-[12px] font-semibold leading-snug mb-1">{label}</p>
                          <p className="text-[11px] opacity-60 leading-snug">{description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Data */}
                <div className="space-y-4">
                  <h2 className="text-[11px] font-semibold tracking-widest uppercase text-white/30">
                    Do you have data?
                  </h2>
                  <p className="text-[12px] text-white/40">
                    Kora trains on your data — product catalogues, support history, sales records, customer interactions.
                    Having data helps, but even rough files or exports are a start.
                  </p>
                  <div className="flex gap-3">
                    {[
                      { val: true, label: 'Yes — I have files / exports' },
                      { val: false, label: 'Not yet — but I can gather it' },
                    ].map(({ val, label }) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => set('hasData', val)}
                        className={`
                          flex-1 h-10 rounded-xl border text-[12px] font-medium transition-all duration-150
                          ${form.hasData === val
                            ? 'border-amber-500/60 bg-amber-500/[0.08] text-amber-300'
                            : 'border-white/8 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/60'
                          }
                        `}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-4">
                  <h2 className="text-[11px] font-semibold tracking-widest uppercase text-white/30">
                    Where should we reach you?
                  </h2>
                  <Field
                    label="Email address *"
                    type="email"
                    value={form.email}
                    onChange={(v) => set('email', v)}
                    placeholder="you@yourbusiness.com"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-white/25 leading-relaxed max-w-xs">
                    No spam. No sales pipeline. A real person will read this and reply.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="
                      px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                      text-white text-[13px] font-semibold transition-colors duration-150 whitespace-nowrap
                    "
                  >
                    {submitting ? 'Sending…' : 'Send enquiry →'}
                  </button>
                </div>

              </motion.form>
            )}
          </AnimatePresence>
        </section>

      </main>

      <Footer />
    </>
  );
}

// ---------------------------------------------------------------------------
// Field component
// ---------------------------------------------------------------------------
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-10 rounded-xl bg-white/[0.04] border border-white/10
          text-white text-[13px] px-3 placeholder:text-white/20
          focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20
          transition-colors duration-150
        "
      />
    </div>
  );
}
