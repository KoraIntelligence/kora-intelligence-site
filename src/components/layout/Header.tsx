// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Companions', href: '/companions' },
  { label: 'Dispatches', href: '/dispatch' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 h-14"
        initial={false}
        animate={
          scrolled
            ? { backgroundColor: 'rgba(0,0,0,0.82)', borderColor: 'rgba(255,255,255,0.06)' }
            : { backgroundColor: 'rgba(0,0,0,0.20)', borderColor: 'rgba(255,255,255,0)' }
        }
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ backdropFilter: 'blur(12px)', borderBottom: '1px solid' }}
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 max-w-6xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <Image
              src="/kora-logo.png"
              alt="Kora Intelligence"
              width={22}
              height={22}
              className="opacity-90 group-hover:opacity-100 transition-opacity duration-150"
            />
            <span className="text-[13px] font-semibold tracking-tight text-white">
              Kora
            </span>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden sm:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = router.pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    text-[13px] font-medium transition-colors duration-150
                    ${isActive
                      ? 'text-white'
                      : 'text-white/55 hover:text-white/90'
                    }
                  `}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: CTA + hamburger */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/companions"
              className="
                hidden sm:inline-flex items-center
                px-4 py-1.5 rounded-full
                text-[11px] font-semibold tracking-wide uppercase
                bg-amber-500 hover:bg-amber-400
                text-white transition-colors duration-150
              "
            >
              Begin Journey
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="sm:hidden p-1.5 text-white/70 hover:text-white transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center gap-10"
          >
            {NAV_LINKS.map(({ label, href }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.07 }}
              >
                <Link
                  href={href}
                  className="text-2xl font-semibold text-white/75 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: NAV_LINKS.length * 0.07 + 0.05 }}
            >
              <Link
                href="/companions"
                className="
                  mt-4 inline-block px-10 py-3 rounded-full
                  bg-amber-500 hover:bg-amber-400
                  text-white font-semibold text-base
                  transition-colors duration-150
                "
              >
                Begin Your Journey
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
