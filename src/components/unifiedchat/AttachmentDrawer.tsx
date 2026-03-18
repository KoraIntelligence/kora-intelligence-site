// src/components/unifiedchat/AttachmentDrawer.tsx
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadCloud, File, X } from 'lucide-react';

export type AttachmentItem = {
  id: string;
  file: File;
};

type Props = {
  isOpen: boolean;
  attachments: AttachmentItem[];
  companion: 'salar' | 'lyra';
  onClose: () => void;
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() ?? 'FILE';
}

export default function AttachmentDrawer({ isOpen, attachments, companion, onClose, onAdd, onRemove }: Props) {
  const isLyra = companion === 'lyra';
  const companionName = isLyra ? 'Lyra' : 'Salar';
  const accentText = isLyra ? 'text-teal-500 dark:text-teal-400' : 'text-yellow-500 dark:text-yellow-400';
  const accentBorder = isLyra ? 'border-teal-500/40 dark:border-teal-400/30' : 'border-yellow-500/40 dark:border-yellow-400/30';
  const accentBadge = isLyra ? 'border-teal-500/40 text-teal-600 dark:text-teal-400 dark:border-teal-400/30' : 'border-yellow-500/40 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400/30';
  const accentBg = isLyra ? 'bg-teal-500 hover:bg-teal-400' : 'bg-yellow-500 hover:bg-yellow-400';
  const ambientGradient = isLyra
    ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.07) 0%, transparent 100%)'
    : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 100%)';

  return (
    <Sheet open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side='left' className='w-80 flex flex-col p-0 bg-white dark:bg-[#171717] border-r border-gray-100 dark:border-neutral-800 overflow-hidden'>
        <div className='relative px-5 pt-5 pb-4 flex-shrink-0'>
          <div className='absolute inset-x-0 top-0 h-20 pointer-events-none' style={{ background: ambientGradient }} />
          <SheetHeader className='relative z-10 p-0 space-y-0'>
            <SheetTitle className='text-sm font-semibold text-gray-900 dark:text-gray-100'>Attachments</SheetTitle>
            <p className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 mt-0.5'>{companionName}</p>
          </SheetHeader>
        </div>
        <div className='h-px bg-gray-100 dark:bg-neutral-800 mx-5 flex-shrink-0' />
        <div className='flex-1 overflow-y-auto px-5 py-4 space-y-5'>
          <label className='block cursor-pointer'>
            <div className={'rounded-xl border-[1.5px] border-dashed ' + accentBorder + ' px-4 py-6 flex flex-col items-center gap-2.5 text-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150'}>
              <UploadCloud size={20} className={accentText} strokeWidth={1.5} />
              <div>
                <p className='text-[12px] font-medium text-gray-700 dark:text-gray-300'>Add a file</p>
                <p className='text-[10px] text-gray-400 dark:text-gray-400 mt-0.5'>PDF · DOCX · XLSX · CSV</p>
              </div>
            </div>
            <input type='file' className='hidden' accept='.pdf,.docx,.xlsx,.csv' onChange={(e) => { const file = e.target.files?.[0]; if (file) { onAdd(file); e.target.value = ''; } }} />
          </label>
          {attachments.length > 0 && (
            <div className='space-y-2'>
              <p className='text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium'>Queued · {attachments.length}</p>
              {attachments.map((att) => (
                <Card key={att.id} className='flex items-center gap-3 px-3 py-2.5 bg-gray-50/50 dark:bg-[#222222] border border-gray-100 dark:border-neutral-800 rounded-lg shadow-none'>
                  <File size={14} className='text-gray-400 dark:text-gray-400 flex-shrink-0' strokeWidth={1.5} />
                  <div className='flex-1 min-w-0'>
                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate leading-snug'>{att.file.name}</p>
                    <p className='text-[10px] text-gray-400 dark:text-gray-400 leading-none mt-0.5'>{formatFileSize(att.file.size)}</p>
                  </div>
                  <Badge variant='outline' className={'text-[8px] tracking-widest uppercase px-1.5 py-0.5 flex-shrink-0 font-medium ' + accentBadge}>{getExtension(att.file.name)}</Badge>
                  <button onClick={() => onRemove(att.id)} className='flex-shrink-0 text-gray-300 dark:text-gray-300 hover:text-red-400 dark:hover:text-red-500 transition-colors duration-150' aria-label='Remove file'><X size={13} /></button>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div className='flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-neutral-800'>
          <p className='text-[10px] text-gray-400 dark:text-gray-400 leading-relaxed mb-3'>Files are sent with your next message. CSV files power Lyra&apos;s outreach workflows.</p>
          <Button onClick={onClose} className={'w-full ' + accentBg + ' text-white text-sm font-medium rounded-lg h-9'}>Done</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
