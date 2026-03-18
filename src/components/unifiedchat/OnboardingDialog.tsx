// src/components/unifiedchat/OnboardingDialog.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 1 | 2 | 3 | 4;

type Props = {
  isOpen: boolean;
  companion: 'salar' | 'lyra';
  onComplete: (tone: string, brandName?: string, industry?: string) => void;
  onModeSelect: (mode: string) => void;
  onClose: () => void;
};

const MODES: Record<'salar' | 'lyra', { key: string; label: string }[]> = {
  salar: [
    { key: 'commercial_chat', label: 'Commercial Chat' },
    { key: 'proposal_builder', label: 'Proposal Builder' },
    { key: 'contract_advisor', label: 'Contract Advisor' },
    { key: 'pricing_estimation', label: 'Pricing & Estimation' },
    { key: 'commercial_strategist', label: 'Commercial Strategist' },
  ],
  lyra: [
    { key: 'creative_chat', label: 'Creative Chat' },
    { key: 'messaging_advisor', label: 'Messaging Advisor' },
    { key: 'campaign_builder', label: 'Campaign Builder' },
    { key: 'lead_outreach', label: 'Lead Outreach' },
    { key: 'customer_nurture', label: 'Customer Nurture' },
  ],
};

const TONES = ['Calm', 'Bold', 'Warm', 'Direct'];

const stepVariants = {
  enter: { opacity: 0, x: 18 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -14 },
};

export default function OnboardingDialog({
  isOpen,
  companion,
  onComplete,
  onModeSelect,
  onClose,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [tone, setToneLocal] = useState('calm');
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');

  const isLyra = companion === 'lyra';
  const companionName = isLyra ? 'Lyra' : 'Salar';
  const avatarLetter = isLyra ? 'L' : 'S';
  const modes = MODES[companion];

  const accentText = isLyra ? 'text-teal-500 dark:text-teal-400' : 'text-yellow-500 dark:text-yellow-400';
  const accentBgLight = isLyra ? 'bg-teal-500/10' : 'bg-yellow-500/10';
  const accentBg = isLyra ? 'bg-teal-500 hover:bg-teal-400' : 'bg-yellow-500 hover:bg-yellow-400';
  const toggleActiveBg = isLyra
    ? 'data-[state=on]:bg-teal-500 data-[state=on]:text-white data-[state=on]:border-transparent'
    : 'data-[state=on]:bg-yellow-500 data-[state=on]:text-white data-[state=on]:border-transparent';
  const accentHoverCard = isLyra
    ? 'hover:bg-teal-500/[0.06] hover:border-teal-500/50'
    : 'hover:bg-yellow-500/[0.06] hover:border-yellow-500/50';
  const ambientGradient = isLyra
    ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.09) 0%, transparent 70%)'
    : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.09) 0%, transparent 70%)';

  const handleModeSelect = (modeKey: string) => {
    onModeSelect(modeKey);
    setStep(4);
  };

  const handleComplete = (skip: boolean) => {
    const trimmedBrand = brandName.trim();
    const trimmedIndustry = industry.trim();
    if (!skip) {
      if (trimmedBrand) localStorage.setItem('kora_brand_name', trimmedBrand);
      if (trimmedIndustry) localStorage.setItem('kora_brand_industry', trimmedIndustry);
    }
    localStorage.setItem('kora_onboarded', 'true');
    onComplete(
      tone,
      skip ? undefined : trimmedBrand || undefined,
      skip ? undefined : trimmedIndustry || undefined,
    );
    onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem('kora_onboarded', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent
        className="
          max-w-md w-full p-0 gap-0
          bg-white dark:bg-[#171717]
          border border-gray-100 dark:border-neutral-800
          rounded-2xl overflow-hidden
          [&>button[data-radix-dialog-close]]:hidden
        "
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-x-0 top-0 h-28 pointer-events-none"
          style={{ background: ambientGradient }}
        />

        {/* Step progress dots */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 pt-5">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div
              key={s}
              className={[
                'rounded-full transition-all duration-300',
                s === step
                  ? `h-1.5 w-4 ${isLyra ? 'bg-teal-500' : 'bg-yellow-500'}`
                  : 'h-1.5 w-1.5 bg-gray-200 dark:bg-neutral-800',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Step content — fixed min-height prevents dialog size jumping */}
        <div className="relative z-10 overflow-hidden" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait">

            {/* ── Step 1: Welcome ───────────────────────── */}
            {step === 1 && (
              <motion.div
                key="s1"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col items-center text-center px-8 pt-7 pb-8 gap-5"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-full overflow-hidden border border-neutral-700"
                >
                  <Image
                    src={`/assets/glyphs/glyph-${companion}.png`}
                    alt={companion}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Welcome to Kora
                  </h2>
                  <p className="text-[13px] text-gray-500 dark:text-gray-500 leading-relaxed max-w-xs">
                    {isLyra
                      ? 'Lyra handles campaigns, messaging, and outreach — producing structured outputs every time.'
                      : 'Salar handles proposals, pricing, and commercial decisions — producing structured outputs every time.'}
                  </p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className={`mt-1 px-8 py-2.5 rounded-full text-white text-[13px] font-semibold transition-colors duration-150 ${accentBg}`}
                >
                  Get started
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Tone ──────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="s2"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col px-8 pt-7 pb-8 gap-5"
              >
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Set your tone
                  </h2>
                  <p className="text-[12px] text-gray-400 dark:text-gray-400">
                    How would you like {companionName} to respond?
                  </p>
                </div>

                <ToggleGroup
                  type="single"
                  value={tone}
                  onValueChange={(v) => { if (v) setToneLocal(v); }}
                  className="grid grid-cols-2 gap-2"
                >
                  {TONES.map((t) => (
                    <ToggleGroupItem
                      key={t}
                      value={t.toLowerCase()}
                      className={`
                        h-10 rounded-lg text-[12px] font-medium
                        border border-gray-200 dark:border-neutral-800
                        text-gray-500 dark:text-gray-300
                        data-[state=on]:!text-white
                        ${toggleActiveBg}
                        transition-all duration-150
                      `}
                    >
                      {t}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                <div className="flex justify-end">
                  <button
                    onClick={() => { localStorage.setItem('kora_tone', tone); setStep(3); }}
                    className={`px-8 py-2.5 rounded-full text-white text-[13px] font-semibold transition-colors duration-150 ${accentBg}`}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Mode selection ────────────────── */}
            {step === 3 && (
              <motion.div
                key="s3"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col px-8 pt-7 pb-8 gap-4"
              >
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    What would you like to work on?
                  </h2>
                  <p className="text-[12px] text-gray-400 dark:text-gray-400">
                    Choose your starting mode — switch anytime from the sidebar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {modes.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleModeSelect(key)}
                      className={`
                        text-left rounded-xl border px-3 py-2.5
                        text-[11px] font-medium leading-snug
                        text-gray-700 dark:text-gray-300
                        bg-gray-50 dark:bg-[#1c1c1c]
                        border-gray-100 dark:border-neutral-800
                        transition-all duration-150
                        ${accentHoverCard}
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Brand quick-setup ─────────────── */}
            {step === 4 && (
              <motion.div
                key="s4"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col px-8 pt-7 pb-8 gap-5"
              >
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Tell us about your brand
                  </h2>
                  <p className="text-[12px] text-gray-400 dark:text-gray-400">
                    Helps {companionName} tailor outputs to your context.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium">
                      Brand name
                    </Label>
                    <Input
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Acme Studio"
                      className="h-9 text-sm bg-gray-50 dark:bg-[#222222] border-gray-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium">
                      Industry
                    </Label>
                    <Input
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Professional services"
                      className="h-9 text-sm bg-gray-50 dark:bg-[#222222] border-gray-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => handleComplete(true)}
                    className="text-[12px] text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={() => handleComplete(false)}
                    className={`px-8 py-2.5 rounded-full text-white text-[13px] font-semibold transition-colors duration-150 ${accentBg}`}
                  >
                    Get started
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
