'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface StatItem {
  number: string;
  label: string;
  detail: string;
}

interface StatsSectionProps {
  stats: StatItem[];
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const easeOut = [0.215, 0.61, 0.355, 1] as const;

  return (
    <section className="relative z-20 -mt-10 content-width">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.25, ease: easeOut }}
        className="grid grid-cols-2 gap-3 rounded-3xl border border-accent-cream bg-white p-6 shadow-xl md:grid-cols-4 md:p-8"
      >
        {stats.map((item, idx) => (
          <motion.div
            key={item.label}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`p-3 text-center cursor-default ${
              idx !== stats.length - 1 ? 'md:border-r md:border-gray-200' : ''
            }`}
          >
            <div className="text-3xl font-black tracking-tight text-brand md:text-4xl transition-colors duration-150 hover:text-brand-dark">
              {item.number}
            </div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-wider text-gray-800">
              {item.label}
            </div>
            <div className="mt-0.5 text-[11px] text-gray-500">{item.detail}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
