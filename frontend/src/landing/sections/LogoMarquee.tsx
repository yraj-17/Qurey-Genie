import { motion } from 'framer-motion';
import { Database, Server, Cpu, Code2, Boxes, Cloud, Layers, Lock, Workflow } from 'lucide-react';

const TECH = [
  { name: 'FastAPI', icon: Server },
  { name: 'LangChain', icon: Workflow },
  { name: 'Groq LPU', icon: Cpu },
  { name: 'MySQL', icon: Database },
  { name: 'PostgreSQL', icon: Database },
  { name: 'SQLAlchemy', icon: Layers },
  { name: 'React 18', icon: Code2 },
  { name: 'Docker', icon: Boxes },
  { name: 'Nginx', icon: Cloud },
  { name: 'bcrypt', icon: Lock },
];

export default function LogoMarquee() {
  return (
    <section className="py-14 border-y border-white/5 bg-black/20 backdrop-blur-xl">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-medium"
      >
        Built on a battle-tested, open-source stack
      </motion.p>

      <div className="marquee">
        <div className="marquee-track">
          {[...TECH, ...TECH].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-white/55 hover:text-white/90 transition-colors px-1"
            >
              <t.icon size={20} className="text-brand-300" />
              <span className="text-sm font-medium tracking-tight whitespace-nowrap">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
