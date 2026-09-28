'use client';

import { motion } from 'framer-motion';

/**
 * Generic animated illustration placeholder for marketing sections.
 * A soft, glowing "constellation" of connected nodes — standing in for
 * a family's connections until real illustration/artwork is supplied.
 */
export function AnimatedIllustrationPlaceholder({ className }: { className?: string }) {
  const nodes = [
    { x: 60, y: 40 }, { x: 180, y: 30 }, { x: 260, y: 110 },
    { x: 140, y: 140 }, { x: 40, y: 160 }, { x: 220, y: 200 },
  ] as const;
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [2, 5]];

  return (
    <motion.svg
      viewBox="0 0 300 220"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {edges.map(([a, b], i) => {
        const from = nodes[a]!;
        const to = nodes[b]!;
        return (
          <motion.line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="rgba(224,142,69,0.35)"
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.15 }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={10}
          fill="#E08E45"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        />
      ))}
    </motion.svg>
  );
}
