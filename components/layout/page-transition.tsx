'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Wraps dashboard page content in a subtle fade+slide transition on
 * every route change. Keyed by pathname (not search params — switching
 * a tab or filter via ?query= shouldn't replay the whole page-enter
 * animation, only navigating to a genuinely different page should).
 * AnimatePresence with mode="wait" ensures the old page finishes
 * leaving before the new one enters, so nothing overlaps mid-transition.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
