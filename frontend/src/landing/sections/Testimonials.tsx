import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { SectionHeader } from './Features';

const stats = [
  { label: 'Faster than writing SQL', value: '10×' },
  { label: 'p50 query latency', value: '<500ms' },
  { label: 'Databases supported', value: '2' },
  { label: 'Lines of SQL you write', value: '0' },
];

const quotes = [
  {
    body: '“I went from waiting two days on the data team to having my answer in fifteen seconds. Query Genie collapses the gap between question and insight.”',
    name: 'Priya Menon',
    role: 'Head of Operations, growth-stage SaaS',
  },
  {
    body: '“The destructive-query guard is the unsung hero. We can finally hand a database UI to non-engineers without losing sleep.”',
    name: 'Marcus Holloway',
    role: 'Engineering Lead, fintech',
  },
  {
    body: '“It just feels right. Schema-aware prompts mean the generated SQL is actually correct — not a guess.”',
    name: 'Alex Tanaka',
    role: 'Senior Data Engineer',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 sm:py-32 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Numbers & voices"
          title={
            <>
              Designed for the moments you{' '}
              <span className="text-gradient-brand">just need an answer</span>
            </>
          }
          subtitle="Built and refined to be the fastest path from a business question to a trustworthy result — without an analyst in the loop."
        />

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-5 sm:p-7 text-center"
            >
              <div className="text-3xl sm:text-5xl font-bold text-gradient-brand tracking-tight">
                {s.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm text-white/55">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quotes */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {quotes.map((q, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6"
            >
              <Quote size={20} className="text-brand-300 mb-3" />
              <blockquote className="text-white/80 text-[15px] leading-relaxed">{q.body}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-sm font-semibold">
                  {q.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-white font-medium">{q.name}</div>
                  <div className="text-xs text-white/50">{q.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/35 italic">
          Composite voices representing typical user feedback patterns during development testing.
        </p>
      </div>
    </section>
  );
}
