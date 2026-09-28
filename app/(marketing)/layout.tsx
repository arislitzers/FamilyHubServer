import type { ReactNode } from 'react';
import { LandingLayout } from '@/components/layout/landing-layout';

export default function MarketingGroupLayout({ children }: { children: ReactNode }) {
  return <LandingLayout>{children}</LandingLayout>;
}
