import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-200 text-center py-6 text-sm font-serif">
      <Image
        src="/paths-unknown-logo.png"
        alt="Paths Unknown logo"
        width={40}
        height={40}
        className="mx-auto mb-2 opacity-90 hover:opacity-100 transition-opacity max-h-10"
      />
      <p className="text-xs text-center mt-4">Paths Unknown</p>
      <p>Rooted in myth. Guided by listening.</p>
      <p className="text-xs mt-1">A project of Paths Unknown</p>
    </footer>
  );
}
