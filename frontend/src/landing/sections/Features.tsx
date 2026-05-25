import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldAlert,
  Database,
  History,
  KeyRound,
  Brain,
  Table2,
  Network,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: 'primary' | 'amber' | 'emerald' | 'rose';
  span?: 'col-span-1' | 'col-span-2';
}

const features: Feature[] = [
  {
    icon: Brain,
    title: 'Schema-aware AI',
    description:
      'LangChain feeds your live database schema into a structured prompt — every query is grounded in real tables, columns, and relationships.',
    accent: 'primary',
    span: 'col-span-2',
  },
  {
    icon: Sparkles,
    title: 'Natural language → SQL',
    description: 'Ask anything in English. Get production-grade SQL in milliseconds via Groq LPU.',
    accent: 'primary',
  },
  {
    icon: ShieldAlert,
    title: 'Destructive-query guard',
    description:
      'Automatic detection of DROP, DELETE, and UPDATE statements. Explicit confirmation required before anything mutates your data.',
    accent: 'rose',
  },
  {
    icon: Database,
    title: 'MySQL & PostgreSQL',
    description:
      'One unified backend, two dialects. Connect with your own credentials — your data never leaves your control.',
    accent: 'emerald',
  },
  {
    icon: Table2,
    title: 'Interactive results',
    description: 'Sortable, searchable tables. Copy SQL with one click. Export when you need to.',
    accent: 'primary',
  },
  {
    icon: History,
    title: 'Persistent chat history',
    description:
      'Every conversation saved, renamable, starrable. Pick up where you left off across sessions.',
    accent: 'amber',
  },
  {
    icon: KeyRound,
    title: 'OTP email auth',
    description:
      'Secure signup with one-time codes. bcrypt-hashed passwords. Rate-limited endpoints out of the box.',
    accent: 'emerald',
  },
  {
    icon: Network,
    title: 'Connection pooling',
    description:
      'SQLAlchemy-backed pools keep latency low and your DBA happy. Multi-tenant ready.',
    accent: 'primary',
    span: 'col-span-2',
  },
];

const accentMap = {
  primary: { bg: 'from-brand-500/15', border: 'border-brand-400/30', text: 'text-brand-300' },
  amber: { bg: 'from-amber-500/15', border: 'border-amber-400/30', text: 'text-amber-300' },
  emerald: {
    bg: 'from-emerald-500/15',
    border: 'border-emerald-400/30',
    text: 'text-emerald-300',
  },
  rose: { bg: 'from-rose-500/15', border: 'border-rose-400/30', text: 'text-rose-300' },
};

export default function Features() {
  return (
    <section id="features" className="relative py-28 sm:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Features"
          title={
            <>
              Everything you need to <span className="text-gradient-brand">interrogate your data</span>
            </>
          }
          subtitle="Query Genie isn't a wrapper around a chatbot. It's a thoughtfully designed analytical surface — schema-aware, safety-first, and built for real production databases."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const a = accentMap[f.accent ?? 'primary'];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className={`group glass-card rounded-2xl p-6 sm:p-7 relative overflow-hidden ${
                  f.span ?? 'col-span-1'
                }`}
              >
                {/* Hover spotlight */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${a.bg} to-transparent`}
                />

                <div className="relative">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${a.border} bg-white/5 ${a.text} mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <f.icon size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-white/60 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="pill mb-6"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
        {eyebrow}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-5xl font-bold tracking-tight text-white"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-5 text-lg text-white/60 leading-relaxed"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
