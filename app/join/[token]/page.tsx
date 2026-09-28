import Link from 'next/link';
import { Home, Users, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getInviteLinkPreview } from '@/services/families.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SITE } from '@/constants/site';
import { ROUTES } from '@/constants/routes';
import { AcceptInviteButton } from './accept-invite-button';

export default async function JoinInvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { familyName, isValid, reason } = await getInviteLinkPreview(params.token);
  const redirectTo = `/join/${params.token}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dusk-gradient px-6">
      <Link href={ROUTES.home} className="mb-8 flex items-center gap-2 text-linen-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-hearth-400 text-dusk-900">
          <Home className="h-4 w-4" />
        </span>
        <span className="font-display text-lg">{SITE.name}</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {!isValid ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
                <XCircle className="h-6 w-6" />
              </div>
              <h1 className="font-display text-xl text-dusk-700 dark:text-linen-100">
                This invite isn&apos;t valid
              </h1>
              <p className="text-sm text-dusk-400 dark:text-dusk-200">
                {reason ?? 'Ask whoever sent it for a new invite link.'}
              </p>
              <Button variant="outline" asChild className="mt-2">
                <Link href={ROUTES.home}>Go to FamilyHub</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hearth-100 text-hearth-600 dark:bg-hearth-900/40 dark:text-hearth-200">
                <Users className="h-6 w-6" />
              </div>
              <h1 className="font-display text-xl text-dusk-700 dark:text-linen-100">
                Join {familyName}
              </h1>
              <p className="text-sm text-dusk-400 dark:text-dusk-200">
                You&apos;ve been invited to join this family on FamilyHub.
              </p>

              {user ? (
                <div className="w-full">
                  <AcceptInviteButton token={params.token} />
                </div>
              ) : (
                <div className="flex w-full flex-col gap-2">
                  <Button asChild size="lg">
                    <Link href={`${ROUTES.login}?redirectTo=${encodeURIComponent(redirectTo)}`}>
                      Log in to accept
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link href={ROUTES.register}>Create an account</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
