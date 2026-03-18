// src/components/unifiedchat/IdentityOverlay.tsx
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

type IdentityOverlayProps = {
  isOpen: boolean;
  mode: string;
  onClose: () => void;
  identity?: {
    persona?: string;
    tone?: string;
    mode?: string;
    description?: string;
    systemPrompt?: string;
    [key: string]: any;
  } | null;
  companion: 'salar' | 'lyra';
};

function toTitleCase(str: string): string {
  return str.replace(/_/g, ' ').replace(/w/g, (c) => c.toUpperCase());
}

export default function IdentityOverlay({
  isOpen,
  mode,
  onClose,
  identity,
  companion,
}: IdentityOverlayProps) {
  const isLyra = companion === 'lyra';
  const companionName = isLyra ? 'Lyra' : 'Salar';
  const avatarLetter = isLyra ? 'L' : 'S';

  const accentText = isLyra
    ? 'text-teal-500 dark:text-teal-400'
    : 'text-yellow-500 dark:text-yellow-400';

  const accentBgLight = isLyra
    ? 'bg-teal-500/10 dark:bg-teal-500/[0.12]'
    : 'bg-yellow-500/10 dark:bg-yellow-500/[0.12]';

  const accentBorder = isLyra
    ? 'border-teal-500 dark:border-teal-400'
    : 'border-yellow-500 dark:border-yellow-400';

  const accentBadgeBorder = isLyra
    ? 'border-teal-500/40 text-teal-600 dark:text-teal-400 dark:border-teal-400/30'
    : 'border-yellow-500/40 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400/30';

  const ambientGradient = isLyra
    ? 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 100%)'
    : 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 100%)';

  const hasContent = !!identity;

  return (
    <Sheet open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side='right'
        className='w-[400px] max-w-full flex flex-col p-0 bg-white dark:bg-[#171717] border-l border-gray-100 dark:border-neutral-800 overflow-hidden'
      >
        {/* Header */}
        <div className='relative px-6 pt-6 pb-5'>
          <div
            className='absolute inset-x-0 top-0 h-24 pointer-events-none'
            style={{ background: ambientGradient }}
          />
          <SheetHeader className='relative z-10 p-0 space-y-0'>
            <div className='flex items-center gap-3 mb-3'>
              <div className={'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[17px] font-semibold ' + accentBgLight + ' ' + accentText}>
                {avatarLetter}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <SheetTitle className='text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight'>
                    {companionName}
                  </SheetTitle>
                  <Badge
                    variant='outline'
                    className={'text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full font-medium ' + accentBadgeBorder}
                  >
                    {mode.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {identity?.tone && (
                  <span className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 mt-0.5 block'>
                    {identity.tone}
                  </span>
                )}
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Divider */}
        <div className='h-px bg-gray-100 dark:bg-neutral-800 mx-6' />

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-5 space-y-6'>
          {!hasContent ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <div className={'w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold ' + accentBgLight + ' ' + accentText}>
                {avatarLetter}
              </div>
              <p className='text-[11px] text-gray-400 dark:text-gray-400 text-center'>
                Identity information not available
              </p>
            </div>
          ) : (
            <>
              {identity?.persona && (
                <section>
                  <p className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium mb-2'>
                    Persona
                  </p>
                  <blockquote className={'border-l-[3px] ' + accentBorder + ' pl-4 text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed'}>
                    {identity.persona}
                  </blockquote>
                </section>
              )}

              <section>
                <p className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium mb-2'>
                  Active Mode
                </p>
                <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                  {toTitleCase(mode)}
                </p>
              </section>

              {identity?.description && (
                <section>
                  <p className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium mb-2'>
                    Mode Description
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                    {identity.description}
                  </p>
                </section>
              )}

              {identity?.tone && (
                <section>
                  <p className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium mb-2'>
                    Tone Profile
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line'>
                    {identity.tone}
                  </p>
                </section>
              )}

              {identity?.systemPrompt && (
                <section>
                  <p className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium mb-2'>
                    System Prompt
                  </p>
                  <div className='bg-gray-50 dark:bg-[#222222] border border-gray-100 dark:border-neutral-800 rounded-lg p-3 overflow-auto max-h-48 text-[11px] font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed'>
                    {identity.systemPrompt}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
