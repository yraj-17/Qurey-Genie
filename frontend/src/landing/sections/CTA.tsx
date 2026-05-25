import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Github, Terminal } from 'lucide-react';
import logo from '../assets/logo.png';

export default function CTA() {
  return (
    <section id="cta" className="relative py-28 sm:py-36 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-5xl"
      >
        {/* Background glow */}
        <div
          className="absolute -inset-8 -z-10 rounded-[3rem] blur-3xl opacity-50"
          style={{
            background:
              'radial-gradient(ellipse at 30% 30%, #7c3aed, transparent 70%), radial-gradient(ellipse at 70% 70%, #4c1d95, transparent 70%)',
          }}
        />

        <div className="relative glass-card rounded-3xl px-6 sm:px-12 py-14 sm:py-20 text-center overflow-hidden">
          {/* Orbiting genie logo */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative inline-block mb-6"
          >
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-70"
              style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
            />
            <img src={logo} alt="Query Genie" className="relative w-16 h-16 sm:w-20 sm:h-20" />
          </motion.div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Your data has answers. <br />
            <span className="text-gradient-brand">Ask out loud.</span>
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/65 leading-relaxed">
            Spin up Query Genie locally in under five minutes. Connect your own database, ask in
            English, ship insights. No credit card, no lock-in, fully open source.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="/auth?mode=signup" className="btn-primary shine text-base">
              <Sparkles size={17} />
              Get Started — It's Free
              <ArrowRight size={17} />
            </a>
            <a
              href="https://github.com/Rajyadav999"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-base"
            >
              <Github size={17} />
              Star on GitHub
            </a>
          </div>

          {/* Quickstart command */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-sm text-white/80"
          >
            <Terminal size={14} className="text-brand-300" />
            <span className="text-brand-300">$</span>
            <span>docker-compose up</span>
            <span className="hidden sm:inline text-white/30 ml-2 text-xs">
              # frontend, backend, db — ready
            </span>
          </motion.div>

          {/* Floating sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${5 + Math.random() * 90}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            >
              <Sparkles size={10 + Math.random() * 6} className="text-brand-300/70" />
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
