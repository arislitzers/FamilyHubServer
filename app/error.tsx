'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real error reporting (e.g. Sentry) in a later prompt.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-linen-200 px-6 text-center dark:bg-dusk-900">
      <p className="font-mono text-sm tracking-widest text-hearth-500">500</p>
      <h1 className="max-w-md text-balance font-display text-4xl text-dusk-700 dark:text-linen-100">
        Something went wrong on our end.
      </h1>
      <p className="max-w-sm text-dusk-400 dark:text-dusk-200">
        Nothing was lost — try again, and it should sort itself out.
      </p>
      <Button onClick={() => reset()} className="mt-4">
        Try again
      </Button>
    </main>
  );
}
