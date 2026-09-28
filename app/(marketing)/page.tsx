import Link from 'next/link';
import {
  UserCircle,
  CalendarDays,
  BellRing,
  MessageCircle,
  ArrowRight,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedIllustrationPlaceholder } from '@/components/shared/animated-illustration-placeholder';
import { FEATURES_PREVIEW, SITE, TESTIMONIALS_PLACEHOLDER } from '@/constants/site';
import { ROUTES } from '@/constants/routes';

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCircle,
  CalendarDays,
  BellRing,
  MessageCircle,
};

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hearth-glow px-6 pb-24 pt-20 text-linen-100 sm:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-hearth-200">
              Now in early access
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {SITE.tagline}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-linen-300">{SITE.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href={ROUTES.register}>
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-linen-100" asChild>
                <Link href={ROUTES.login}>Log in</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <AnimatedIllustrationPlaceholder className="h-64 w-full max-w-md" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-linen-200 px-6 py-24 dark:bg-dusk-900">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-dusk-700 dark:text-linen-100">
              Everything your family needs, in one calm place.
            </h2>
            <p className="mt-3 text-dusk-400 dark:text-dusk-200">
              These modules are on the way — this preview shows what&apos;s coming to FamilyHub next.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES_PREVIEW.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon];
              return (
                <Card key={feature.title} className="transition-shadow hover:shadow-lifted">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-hearth-100 text-hearth-600 dark:bg-hearth-900/40 dark:text-hearth-200">
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <h3 className="font-display text-lg text-dusk-700 dark:text-linen-100">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-dusk-400 dark:text-dusk-200">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-linen-300/60 px-6 py-24 dark:bg-dusk-800">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-xl font-display text-3xl text-dusk-700 dark:text-linen-100">
            Families are already finding their rhythm.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS_PLACEHOLDER.map((t, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Quote className="mb-3 h-5 w-5 text-hearth-400" />
                  <p className="text-sm text-dusk-600 dark:text-linen-200">{t.quote}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-dusk-700 dark:text-linen-100">{t.name}</p>
                    <p className="text-xs text-dusk-400 dark:text-dusk-300">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dusk-gradient px-6 py-24 text-center text-linen-100">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-balance font-display text-3xl sm:text-4xl">
            Bring your family closer, starting today.
          </h2>
          <p className="mt-4 text-linen-300">
            Set up your family&apos;s home base in FamilyHub in just a few minutes.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href={ROUTES.register}>
              Create your family&apos;s space <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
