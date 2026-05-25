import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Database, Zap } from 'lucide-react';
import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';

const TYPED_QUESTIONS = [
  'Show the top 5 customers by total purchase amount',
  'List employees hired in the last 6 months',
  'Find products with stock below 20 grouped by category',
  'Average order value per region this quarter',
];

const GENERATED_SQL = `SELECT
  c.customer_name,
  SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o
  ON c.id = o.customer_id
GROUP BY c.customer_name
ORDER BY total_spent DESC
LIMIT 5;`;

function highlightSQL(sql: string) {
  const keywords = ['SELECT', 'FROM', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'WHERE', 'AS', 'DESC', 'ASC'];
  const functions = ['SUM', 'COUNT', 'AVG', 'MIN', 'MAX'];
  return sql
    .split('\n')
    .map((line) => {
      let out = line;
      keywords.forEach((k) => {
        out = out.replace(new RegExp(`\\b${k}\\b`, 'g'), `<span class="sql-keyword">${k}</span>`);
      });
      functions.forEach((f) => {
        out = out.replace(new RegExp(`\\b${f}\\b`, 'g'), `<span class="sql-function">${f}</span>`);
      });
      out = out.replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>');
      return out;
    })
    .join('\n');
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [typedIdx, setTypedIdx] = useState(0);
  const [typed, setTyped] = useState('');

  // Typewriter loop through example questions
  useEffect(() => {
    if (prefersReducedMotion) {
      setTyped(TYPED_QUESTIONS[0]);
      return;
    }
    const full = TYPED_QUESTIONS[typedIdx];
    let i = 0;
    let timeout: number;
    const tick = () => {
      if (i <= full.length) {
        setTyped(full.slice(0, i));
        i++;
        timeout = window.setTimeout(tick, 38);
      } else {
        timeout = window.setTimeout(() => {
          // erase
          const erase = () => {
            if (i > 0) {
              setTyped(full.slice(0, i));
              i--;
              timeout = window.setTimeout(erase, 18);
            } else {
              setTypedIdx((p) => (p + 1) % TYPED_QUESTIONS.length);
            }
          };
          erase();
        }, 2200);
      }
    };
    tick();
    return () => clearTimeout(timeout);
  }, [typedIdx, prefersReducedMotion]);

  return (
    <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 px-4">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Pill / announcement */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="flex justify-center mb-8"
        >
          <a href="#features" className="pill group hover:bg-brand-500/20 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            Now with Groq LPU — sub-second SQL generation
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-center font-bold tracking-tight text-[2.4rem] leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          <span className="text-gradient">Talk to your database</span>
          <br />
          <span className="text-white/95">in plain </span>
          <span className="relative inline-block">
            <span className="text-gradient-brand">English</span>
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 1, ease: 'easeInOut' }}
              viewBox="0 0 200 12"
              className="absolute -bottom-2 left-0 w-full"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M2 8 Q 50 2, 100 6 T 198 4"
                stroke="url(#underline-grad)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="underline-grad" x1="0" x2="1">
                  <stop offset="0" stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </motion.svg>
          </span>
          <span className="text-white/95">.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-7 max-w-2xl mx-auto text-center text-lg sm:text-xl text-white/65 leading-relaxed"
        >
          Query Genie turns natural-language questions into{' '}
          <span className="text-white/90">production-grade SQL</span> and runs them safely on your
          MySQL or PostgreSQL database. Powered by Groq LLM and LangChain — schema-aware,
          context-rich, lightning-fast.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a href="/auth?mode=signup" className="btn-primary shine">
            <Sparkles size={16} />
            Start Querying Free
            <ArrowRight size={16} />
          </a>
          <a href="#how" className="btn-secondary">
            See how it works
          </a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/55"
        >
          <span className="flex items-center gap-1.5">
            <Star size={13} className="text-amber-300 fill-amber-300" /> No SQL skills required
          </span>
          <span className="flex items-center gap-1.5">
            <Database size={13} className="text-brand-300" /> MySQL & PostgreSQL
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={13} className="text-amber-300" /> Sub-second responses
          </span>
        </motion.div>

        {/* Visual showcase: prompt → SQL */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 sm:mt-20 mx-auto max-w-5xl"
        >
          {/* Floating genie logo */}
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-60 bg-brand-500" />
              <img src={logo} alt="" className="relative w-20 h-20 sm:w-24 sm:h-24" />
            </div>
          </motion.div>

          {/* Window chrome */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="text-xs text-white/40 font-mono">query-genie • new chat</div>
              <div className="text-xs text-emerald-300/80 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> sales_db
                connected
              </div>
            </div>

            <div className="grid lg:grid-cols-2">
              {/* Left: prompt */}
              <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/5">
                <div className="text-xs uppercase tracking-wider text-white/40 mb-3 font-medium">
                  You ask
                </div>
                <div className="text-lg sm:text-xl text-white/95 leading-relaxed font-medium min-h-[3.5rem]">
                  {typed}
                  <span className="inline-block w-[2px] h-5 sm:h-6 bg-brand-300 ml-1 align-middle animate-caret-blink" />
                </div>

                <div className="mt-8 space-y-2">
                  <Step label="Fetching schema" done />
                  <Step label="Building context-aware prompt" done />
                  <Step label="Generating SQL with Groq" done />
                  <Step label="Safety scan (DROP / DELETE / UPDATE)" done />
                </div>
              </div>

              {/* Right: SQL output */}
              <div className="p-6 sm:p-8 bg-black/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wider text-white/40 font-medium">
                    Query Genie writes
                  </div>
                  <div className="text-[10px] font-mono text-emerald-300/80 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    SAFE • READ-ONLY
                  </div>
                </div>
                <pre
                  className="font-mono text-[13px] leading-[1.7] text-white/85 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: highlightSQL(GENERATED_SQL) }}
                />
                <div className="mt-5 flex items-center gap-3 text-xs text-white/50">
                  <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                    ⚡ 412ms
                  </span>
                  <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                    5 rows returned
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Soft underglow */}
          <div
            className="absolute inset-x-0 -bottom-12 h-32 blur-3xl opacity-50 -z-10"
            style={{ background: 'radial-gradient(ellipse at center, #7c3aed, transparent 70%)' }}
          />
        </motion.div>
      </div>
    </section>
  );
}

function Step({ label, done }: { label: string; done?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + Math.random() * 0.4 }}
      className="flex items-center gap-2.5 text-sm text-white/65"
    >
      {done ? (
        <span className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-[10px]">
          ✓
        </span>
      ) : (
        <span className="h-4 w-4 rounded-full border border-white/20" />
      )}
      {label}
    </motion.div>
  );
}
