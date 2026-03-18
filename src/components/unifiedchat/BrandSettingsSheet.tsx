// src/components/unifiedchat/BrandSettingsSheet.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Props = {
  isOpen: boolean;
  companion: 'salar' | 'lyra';
  onClose: () => void;
};

export default function BrandSettingsSheet({ isOpen, companion, onClose }: Props) {
  const isLyra = companion === 'lyra';

  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [voiceNotes, setVoiceNotes] = useState('');
  const [saved, setSaved] = useState(false);

  // Load from localStorage on open
  useEffect(() => {
    if (isOpen) {
      setBrandName(localStorage.getItem('kora_brand_name') ?? '');
      setIndustry(localStorage.getItem('kora_brand_industry') ?? '');
      setVoiceNotes(localStorage.getItem('kora_brand_voice') ?? '');
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('kora_brand_name', brandName.trim());
    localStorage.setItem('kora_brand_industry', industry.trim());
    localStorage.setItem('kora_brand_voice', voiceNotes.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setBrandName('');
    setIndustry('');
    setVoiceNotes('');
    localStorage.removeItem('kora_brand_name');
    localStorage.removeItem('kora_brand_industry');
    localStorage.removeItem('kora_brand_voice');
  };

  const accentText = isLyra ? 'text-teal-400' : 'text-yellow-400';
  const accentBg = isLyra ? 'bg-teal-500 hover:bg-teal-400' : 'bg-yellow-500 hover:bg-yellow-400';
  const ambientGradient = isLyra
    ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.07) 0%, transparent 100%)'
    : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 100%)';

  const fieldClass = 'bg-[#222222] border-neutral-800 text-gray-200 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-offset-0 text-sm';
  const labelClass = 'text-[10px] tracking-widest uppercase text-gray-400 font-medium';

  return (
    <Sheet open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="left"
        className="
          w-80 flex flex-col p-0
          bg-[#171717]
          border-r border-neutral-800
          overflow-hidden
          [&>button]:hidden
        "
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 flex-shrink-0">
          <div
            className="absolute inset-x-0 top-0 h-20 pointer-events-none"
            style={{ background: ambientGradient }}
          />
          <SheetHeader className="relative z-10 p-0 space-y-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-semibold text-gray-100">
                Brand Settings
              </SheetTitle>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <p className={`text-[10px] tracking-widest uppercase mt-0.5 ${accentText}`}>
              Stored locally · v2 syncs to workspace
            </p>
          </SheetHeader>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-800 mx-5 flex-shrink-0" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Brand name</Label>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Acme Studio"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Industry</Label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Professional services"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Brand voice notes</Label>
            <Textarea
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              placeholder="e.g. Confident but approachable. Avoid jargon."
              rows={4}
              className={`${fieldClass} resize-none`}
            />
          </div>

          {/* v2 hint */}
          <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
            In v2, brand settings will sync across sessions and inform every companion response automatically.
          </p>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-neutral-800 space-y-2">
          <Button
            onClick={handleSave}
            className={`w-full text-white text-sm font-medium rounded-lg h-9 transition-colors duration-150 ${accentBg}`}
          >
            {saved ? 'Saved ✓' : 'Save brand settings'}
          </Button>
          <button
            onClick={handleClear}
            className="w-full text-[11px] text-gray-400 hover:text-red-400 transition-colors py-1"
          >
            Clear all
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
