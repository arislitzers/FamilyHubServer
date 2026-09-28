'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants/routes';

export function SignOutEverywhereCard() {
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const signOutEverywhere = async () => {
    setSigningOut(true);
    setError(null);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    setSigningOut(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push(ROUTES.login);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sessions</CardTitle>
        <CardDescription>
          Sign out of FamilyHub on every device where you&apos;re currently logged in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          variant="outline"
          onClick={signOutEverywhere}
          disabled={signingOut}
          className="w-fit gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> {signingOut ? 'Signing out...' : 'Sign out everywhere'}
        </Button>
      </CardContent>
    </Card>
  );
}
