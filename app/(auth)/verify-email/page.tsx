import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="Verify your email">
      <div className="flex flex-col items-center gap-4 rounded-md border border-linen-300 bg-linen-100 p-8 text-center dark:border-dusk-600 dark:bg-dusk-800">
        <MailCheck className="h-10 w-10 text-hearth-400" />
        <p className="text-sm text-dusk-500 dark:text-dusk-200">
          We&apos;ve sent a verification link to your email. Click it to activate your account,
          then log in below.
        </p>
        <Button asChild className="mt-2">
          <Link href={ROUTES.login}>Back to log in</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
