import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-200 text-center py-8 text-sm font-serif space-y-2">
      <Image
        src="/paths-unknown-logo.png"
        alt="Paths Unknown"
        width={48}
        height={48}
        className="mx-auto mb-2 opacity-80"
      />
      <p className="text-emerald-100">Rooted in myth. Guided by listening.</p>
      <p className="text-emerald-300">A project of <span className="underline">Paths Unknown</span></p>
    </footer>
  );
}