import { motion } from 'framer-motion';
import {
  Server,
  Cpu,
  Workflow,
  Database,
  Code2,
  Boxes,
  Cloud,
  Layers,
  Lock,
  Zap,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { SectionHeader } from './Features';
import type { LucideIcon } from 'lucide-react';

interface Tech {
  name: string;
  desc: string;
  icon: LucideIcon;
  category: 'frontend' | 'backend' | 'ai' | 'infra';
}

const stack: Tech[] = [
  // Frontend
  { name: 'React 18', desc: 'Concurrent UI', icon: Code2, category: 'frontend' },
  { name: 'TypeScript', desc: 'End-to-end types', icon: Code2, category: 'frontend' },
  { name: 'Vite', desc: 'Instant HMR', icon: Zap, category: 'frontend' },
  { name: 'Tailwind CSS', desc: 'Design tokens', icon: Layers, category: 'frontend' },
  { name: 'shadcn/ui', desc: 'Radix-powered', icon: Boxes, category: 'frontend' },
  // Backend
  { name: 'FastAPI', desc: 'Async Python API', icon: Server, category: 'backend' },
  { name: 'SQLAlchemy', desc: 'ORM + pooling', icon: Database, category: 'backend' },
  { name: 'Pydantic', desc: 'Schema validation', icon: ShieldCheck, category: 'backend' },
  { name: 'Passlib + bcrypt', desc: 'Password hashing', icon: Lock, category: 'backend' },
  { name: 'SlowAPI', desc: 'Rate limiting', icon: ShieldCheck, category: 'backend' },
  // AI
  { name: 'Groq LPU', desc: 'Sub-second inference', icon: Cpu, category: 'ai' },
  { name: 'LangChain', desc: 'Prompt orchestration', icon: Workflow, category: 'ai' },
  // Infra
  { name: 'MySQL', desc: 'Relational DB', icon: Database, category: 'infra' },
  { name: 'PostgreSQL', desc: 'Relational DB', icon: Database, category: 'infra' },
  { name: 'Docker Compose', desc: 'Container orchestration', icon: Boxes, category: 'infra' },
  { name: 'Nginx', desc: 'Reverse proxy', icon: Cloud, category: 'infra' },
];

const catLabel = {
  frontend: 'Frontend',
  backend: 'Backend',
  ai: 'AI / LLM',
  infra: 'Database & Infra',
};

const catColor = {
  frontend: 'text-sky-300 border-sky-400/30 bg-sky-500/10',
  backend: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
  ai: 'text-brand-300 border-brand-400/30 bg-brand-500/10',
  infra: 'text-amber-300 border-amber-400/30 bg-amber-500/10',
};

export default function TechStack() {
  return (
    <section id="tech" className="relative py-28 sm:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="The Stack"
          title={
            <>
              Modern foundations,{' '}
              <span className="text-gradient-brand">production opinionated</span>
            </>
          }
          subtitle="No experimental glue, no unmaintained dependencies. Query Genie is composed from the same primitives top engineering teams ship to production every day."
        />

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {stack.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.035 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="glass-card rounded-xl p-4 sm:p-5 group hover:border-brand-400/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`h-9 w-9 rounded-lg border flex items-center justify-center ${catColor[t.category]}`}
                >
                  <t.icon size={16} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/35 font-medium">
                  {catLabel[t.category]}
                </span>
              </div>
              <div className="font-semibold text-white text-sm sm:text-base">{t.name}</div>
              <div className="text-xs text-white/50 mt-0.5">{t.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Open-source hint */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-sm text-white/50"
        >
          <Terminal size={14} className="inline mr-1.5 text-brand-300" />
          One <code className="px-1.5 py-0.5 rounded-md bg-white/5 text-white/80 font-mono">
            docker-compose up
          </code>{' '}
          and you're running locally.
        </motion.div>
      </div>
    </section>
  );
}
