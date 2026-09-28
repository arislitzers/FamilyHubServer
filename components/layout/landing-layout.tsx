import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-dusk-gradient">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
