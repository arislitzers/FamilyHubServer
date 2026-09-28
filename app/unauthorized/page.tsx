import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-linen-200 px-6 text-center dark:bg-dusk-900">
      <ShieldAlert className="h-10 w-10 text-hearth-500" />
      <h1 className="max-w-md text-balance font-display text-3xl text-dusk-700 dark:text-linen-100">
        You need to log in to see this.
      </h1>
      <p className="max-w-sm text-dusk-400 dark:text-dusk-200">
        Your session may have expired, or you followed a link that requires an account.
      </p>
      <Button asChild className="mt-2">
        <Link href={ROUTES.login}>Log in</Link>
      </Button>
    </main>
  );
}
