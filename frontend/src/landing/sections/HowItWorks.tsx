import { motion } from 'framer-motion';
import { MessageSquareText, Database, Brain, ShieldCheck, PlayCircle, Table2 } from 'lucide-react';
import { SectionHeader } from './Features';

const steps = [
  {
    n: '01',
    icon: MessageSquareText,
    title: 'You ask a question',
    desc: 'Type or paste any analytical question in plain English. No syntax, no schema lookups.',
    accent: 'from-brand-500/20 to-brand-700/10',
  },
  {
    n: '02',
    icon: Database,
    title: 'Schema is fetched',
    desc: 'The backend introspects your connected database — tables, columns, foreign keys, types.',
    accent: 'from-brand-400/20 to-brand-600/10',
  },
  {
    n: '03',
    icon: Brain,
    title: 'LangChain builds the prompt',
    desc: 'A structured, context-aware prompt is composed combining your intent with the live schema.',
    accent: 'from-fuchsia-500/20 to-brand-700/10',
  },
  {
    n: '04',
    icon: PlayCircle,
    title: 'Groq generates SQL',
    desc: 'Groq LPU returns dialect-correct SQL in milliseconds — MySQL or PostgreSQL, your choice.',
    accent: 'from-brand-500/20 to-fuchsia-700/10',
  },
  {
    n: '05',
    icon: ShieldCheck,
    title: 'Safety scan',
    desc: 'Statements are analyzed for destructive operations. Risky queries require explicit confirmation.',
    accent: 'from-rose-500/20 to-brand-700/10',
  },
  {
    n: '06',
    icon: Table2,
    title: 'Execute & render',
    desc: 'Safe queries run on your DB and stream results into a rich, interactive table — sorted, searchable, copyable.',
    accent: 'from-emerald-500/20 to-brand-700/10',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-28 sm:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="How it works"
          title={
            <>
              From <span className="text-gradient-brand">question</span> to{' '}
              <span className="text-gradient-brand">answer</span>, in six steps
            </>
          }
          subtitle="A transparent, end-to-end pipeline. Every step happens in your own infrastructure — your database credentials never leave the connection you control."
        />

        <div className="relative mt-20">
          {/* Connecting line for desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-500/30 to-transparent hidden lg:block" />

          <div className="space-y-10 lg:space-y-16">
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col lg:flex-row items-center gap-6 lg:gap-12 ${
                    isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Card */}
                  <div className="w-full lg:w-[calc(50%-3rem)]">
                    <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                      <div
                        className={`absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl opacity-40 bg-gradient-to-br ${s.accent}`}
                      />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-5xl font-bold text-white/10 tracking-tighter">
                            {s.n}
                          </span>
                          <div className="h-11 w-11 rounded-xl bg-brand-500/15 border border-brand-400/30 text-brand-300 flex items-center justify-center">
                            <s.icon size={20} />
                          </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                          {s.title}
                        </h3>
                        <p className="mt-2.5 text-white/60 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Node on timeline */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 h-12 w-12 items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="relative h-4 w-4 rounded-full bg-brand-500 ring-4 ring-brand-500/20"
                    >
                      <span className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-60" />
                    </motion.div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden lg:block w-[calc(50%-3rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
