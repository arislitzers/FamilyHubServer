import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linen-200 dark:bg-dusk-900">
      <Spinner size="lg" />
    </main>
  );
}
