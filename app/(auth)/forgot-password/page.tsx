'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { ROUTES } from '@/constants/routes';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setFormError(null);
    const { error } = await sendPasswordReset(values.email);
    setSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="flex flex-col items-center gap-3 rounded-md border border-sage-300 bg-sage-50 p-6 text-center dark:border-sage-500/40 dark:bg-sage-600/10">
          <CheckCircle2 className="h-8 w-8 text-sage-500" />
          <p className="text-sm text-sage-700 dark:text-sage-100">
            If an account exists for that email, we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href={ROUTES.login} className="font-medium text-hearth-500 hover:underline">
            Back to log in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="mt-2">
          {submitting ? 'Sending...' : 'Send reset link'}
        </Button>

        <p className="mt-2 text-center text-sm text-dusk-400 dark:text-dusk-200">
          Remembered it?{' '}
          <Link href={ROUTES.login} className="font-medium text-hearth-500 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
