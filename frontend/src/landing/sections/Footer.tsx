import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import Logo from '../components/Logo';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how' },
      { label: 'Showcase', href: '#showcase' },
      { label: 'Tech stack', href: '#tech' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API reference', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'GitHub', href: 'https://github.com/Rajyadav999' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'License (MIT)', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-white/55 leading-relaxed">
              Talk to your database in plain English. AI-powered Natural Language to SQL, built for
              MySQL and PostgreSQL.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://github.com/Rajyadav999"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-lg border border-white/10 hover:border-brand-400/40 hover:bg-brand-500/10 text-white/65 hover:text-white flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github size={15} />
              </a>
              <a
                href="https://www.linkedin.com/in/raj-yadav-706b60397"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-lg border border-white/10 hover:border-brand-400/40 hover:bg-brand-500/10 text-white/65 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-lg border border-white/10 hover:border-brand-400/40 hover:bg-brand-500/10 text-white/65 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={15} />
              </a>
              <a
                href="mailto:hello@querygenie.app"
                className="h-9 w-9 rounded-lg border border-white/10 hover:border-brand-400/40 hover:bg-brand-500/10 text-white/65 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/55 hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/45">
          <p>
            © {new Date().getFullYear()} Query Genie. Crafted by{' '}
            <a
              href="https://github.com/Rajyadav999"
              target="_blank"
              rel="noreferrer"
              className="text-white/65 hover:text-white"
            >
              Raj Yadav
            </a>
            . MIT-licensed.
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
