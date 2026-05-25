import { motion } from 'framer-motion';
import {
  LineChart,
  Users,
  BookOpen,
  Briefcase,
  Code2,
  ShoppingCart,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { SectionHeader } from './Features';

const cases = [
  {
    icon: LineChart,
    title: 'Analysts & PMs',
    body: 'Self-serve metrics without bottlenecking the data team. Ask, validate, ship — in minutes, not days.',
  },
  {
    icon: Briefcase,
    title: 'Founders & Ops',
    body: 'Get answers from your own data without writing SQL or paying for a $400/mo BI seat for occasional questions.',
  },
  {
    icon: Code2,
    title: 'Developers',
    body: 'Prototype queries 10× faster. Use generated SQL as a starting point, refine inline, drop it into production code.',
  },
  {
    icon: Users,
    title: 'Customer success',
    body: 'Pull customer history, usage stats, and account states on demand — even with zero database knowledge.',
  },
  {
    icon: BookOpen,
    title: 'Students & learners',
    body: 'See how natural language maps to SQL. A perfect tutor for anyone learning relational databases.',
  },
  {
    icon: ShoppingCart,
    title: 'E-commerce teams',
    body: 'Inventory thresholds, fastest-moving SKUs, regional sell-through — all without touching a query builder.',
  },
  {
    icon: Building2,
    title: 'Internal tooling',
    body: 'Embed Query Genie behind your SSO to give non-engineers a safe, audited window into operational data.',
  },
  {
    icon: Stethoscope,
    title: 'Research & ops',
    body: 'Cohort analysis, longitudinal stats, distribution checks — fast iteration on questions you didn\'t know you had.',
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="relative py-28 sm:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Who it's for"
          title={
            <>
              Built for everyone who{' '}
              <span className="text-gradient-brand">touches data</span>
            </>
          }
          subtitle="From founders pulling their first investor metric to data teams replacing throw-away SQL with a faster workflow — Query Genie meets you where you are."
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cases.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 sm:p-6 group hover:border-brand-400/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-500/15 border border-brand-400/30 text-brand-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <c.icon size={18} />
              </div>
              <h3 className="font-semibold text-white mb-1.5 tracking-tight">{c.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
