import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from './Logo';

const nav = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Showcase', href: '#showcase' },
  { label: 'Tech', href: '#tech' },
  { label: 'Use cases', href: '#use-cases' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 transition-all duration-300 ${
          scrolled ? 'max-w-5xl' : ''
        }`}
      >
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-300 ${
            scrolled ? 'glass shadow-lg shadow-black/30' : ''
          }`}
        >
          <a href="#" className="shrink-0">
            <Logo />
          </a>

          <ul className="hidden lg:flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="px-3.5 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="https://github.com/Rajyadav999"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a href="/auth?mode=signup" className="btn-primary text-sm py-2.5 px-5">
              <Sparkles size={15} />
              Try Free
            </a>
          </div>

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mx-4 mt-2 glass rounded-2xl p-4"
          >
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    onClick={() => setOpen(false)}
                    href={item.href}
                    className="block px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 rounded-lg"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 rounded-lg"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </li>
              <li className="pt-2">
                <a href="/auth?mode=signup" onClick={() => setOpen(false)} className="btn-primary w-full">
                  <Sparkles size={15} /> Try Free
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
