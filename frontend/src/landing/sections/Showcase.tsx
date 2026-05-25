import { motion } from 'framer-motion';
import { Database, Send, Sparkles, Plus, Star, MoreVertical, ChevronRight } from 'lucide-react';
import { SectionHeader } from './Features';
import logo from '../assets/logo.png';

const sampleRows = [
  ['Acme Corp', '124,580.00', '47'],
  ['Globex Industries', '98,210.50', '32'],
  ['Initech Ltd.', '76,499.99', '28'],
  ['Stark Solutions', '64,820.00', '21'],
  ['Wayne Enterprises', '58,140.25', '19'],
];

export default function Showcase() {
  return (
    <section id="showcase" className="relative py-28 sm:py-36 px-4 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Product"
          title={
            <>
              An interface designed for{' '}
              <span className="text-gradient-brand">flow, not friction</span>
            </>
          }
          subtitle="Every pixel earns its place. Persistent chats on the left, focused composer in the center, query inspector and live results below — all in one calm, dark interface."
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 mx-auto max-w-6xl"
        >
          {/* Backdrop glow */}
          <div
            className="absolute -inset-10 -z-10 rounded-[2rem] blur-3xl opacity-50"
            style={{
              background:
                'radial-gradient(ellipse at 30% 0%, #7c3aed, transparent 70%), radial-gradient(ellipse at 70% 100%, #4c1d95, transparent 60%)',
            }}
          />

          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="text-xs text-white/40 font-mono hidden sm:block">
                querygenie.app / dashboard
              </div>
              <div className="text-xs text-emerald-300/80 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">postgres@analytics</span>
              </div>
            </div>

            <div className="grid grid-cols-12 min-h-[520px]">
              {/* Sidebar */}
              <aside className="col-span-12 sm:col-span-3 border-b sm:border-b-0 sm:border-r border-white/5 bg-black/20 p-4">
                <div className="flex items-center gap-2 mb-5">
                  <img src={logo} alt="" className="h-7 w-7" />
                  <span className="font-semibold text-sm">
                    Query <span className="text-gradient-brand">Genie</span>
                  </span>
                </div>

                <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-500/15 border border-brand-400/30 text-brand-200 text-sm font-medium mb-4 hover:bg-brand-500/25 transition-colors">
                  <Plus size={15} /> New chat
                </button>

                <div className="text-[11px] uppercase tracking-wider text-white/35 px-2 mb-2">
                  Recent
                </div>
                <ul className="space-y-1">
                  {[
                    { t: 'Top customers Q3', s: true, active: true },
                    { t: 'Stock anomalies', s: false },
                    { t: 'Churn cohort analysis', s: true },
                    { t: 'Refunds by region', s: false },
                    { t: 'New signups by week', s: false },
                  ].map((c, i) => (
                    <li
                      key={i}
                      className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer ${
                        c.active
                          ? 'bg-white/8 text-white'
                          : 'text-white/55 hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      <span className="truncate">{c.t}</span>
                      <span className="flex items-center gap-1.5">
                        {c.s && <Star size={11} className="text-amber-300 fill-amber-300" />}
                        <MoreVertical
                          size={13}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Main */}
              <div className="col-span-12 sm:col-span-9 flex flex-col">
                {/* Chat header */}
                <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-brand-300" />
                    <span className="text-sm text-white/70">postgres • analytics_prod</span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-300 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    READ-ONLY
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 space-y-5 overflow-hidden">
                  {/* User bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-md bg-brand-500/15 border border-brand-400/25 rounded-2xl rounded-tr-md px-4 py-2.5">
                      <p className="text-sm text-white/95">
                        Show the top 5 customers by total purchase amount
                      </p>
                    </div>
                  </motion.div>

                  {/* Assistant bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45 }}
                    className="flex gap-3"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full bg-brand-500/20 border border-brand-400/30 flex items-center justify-center">
                      <Sparkles size={14} className="text-brand-300" />
                    </div>
                    <div className="flex-1 max-w-xl">
                      <div className="bg-white/4 border border-white/8 rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                          SQL generated
                        </div>
                        <pre className="font-mono text-[12px] leading-relaxed text-white/85 whitespace-pre-wrap">
                          <span className="sql-keyword">SELECT</span> c.customer_name,{' '}
                          <span className="sql-function">SUM</span>(o.total_amount){' '}
                          <span className="sql-keyword">AS</span> total
                          {'\n'}
                          <span className="sql-keyword">FROM</span> customers c{' '}
                          <span className="sql-keyword">JOIN</span> orders o{' '}
                          <span className="sql-keyword">ON</span> c.id = o.customer_id
                          {'\n'}
                          <span className="sql-keyword">GROUP BY</span> c.customer_name{' '}
                          <span className="sql-keyword">ORDER BY</span> total{' '}
                          <span className="sql-keyword">DESC</span>{' '}
                          <span className="sql-keyword">LIMIT</span>{' '}
                          <span className="sql-number">5</span>;
                        </pre>
                      </div>

                      {/* Results table */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                        className="mt-3 bg-white/4 border border-white/8 rounded-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                          <span className="text-xs text-white/55">5 rows • 412ms</span>
                          <button className="text-[11px] text-brand-300 hover:text-brand-200">
                            Export CSV
                          </button>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-white/3 text-white/55 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="text-left px-4 py-2 font-medium">Customer</th>
                              <th className="text-right px-4 py-2 font-medium">Total ($)</th>
                              <th className="text-right px-4 py-2 font-medium">Orders</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sampleRows.map((r, i) => (
                              <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8 + i * 0.07 }}
                                className="border-t border-white/5 hover:bg-white/3"
                              >
                                <td className="px-4 py-2 text-white/85">{r[0]}</td>
                                <td className="px-4 py-2 text-right font-mono text-emerald-300/90">
                                  {r[1]}
                                </td>
                                <td className="px-4 py-2 text-right text-white/65">{r[2]}</td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Composer */}
                <div className="border-t border-white/5 p-4">
                  <div className="flex items-center gap-2 bg-white/4 border border-white/10 rounded-xl px-3 py-2">
                    <span className="text-xs text-white/40 px-2 py-1 rounded-md bg-white/5 hidden sm:block">
                      ⌘ /
                    </span>
                    <input
                      disabled
                      placeholder="Ask anything about your data…"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35 text-white"
                    />
                    <button className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center hover:brightness-110 transition">
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating callouts */}
          <FloatingCallout
            className="hidden md:flex absolute -left-12 top-1/3"
            label="Safety scan"
            value="Blocks DROP, DELETE, UPDATE"
            color="rose"
          />
          <FloatingCallout
            className="hidden md:flex absolute -right-12 top-2/3"
            label="Latency"
            value="412ms p50"
            color="emerald"
            delay={0.4}
          />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCallout({
  className = '',
  label,
  value,
  color = 'primary',
  delay = 0,
}: {
  className?: string;
  label: string;
  value: string;
  color?: 'primary' | 'emerald' | 'rose';
  delay?: number;
}) {
  const c = {
    primary: 'text-brand-300 border-brand-400/30 bg-brand-500/10',
    emerald: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
    rose: 'text-rose-300 border-rose-400/30 bg-rose-500/10',
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6 + delay, duration: 0.6 }}
      className={`items-center gap-3 glass-card rounded-xl px-3 py-2.5 ${className}`}
    >
      <ChevronRight size={14} className={c.split(' ')[0]} />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/45">{label}</div>
        <div className={`text-xs font-medium ${c.split(' ')[0]}`}>{value}</div>
      </div>
    </motion.div>
  );
}
