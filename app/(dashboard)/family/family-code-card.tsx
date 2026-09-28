'use client';

import { useState, useTransition } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { regenerateFamilyCodeAction } from './actions';

export function FamilyCodeCard({ familyId, familyCode, isAdmin }: { familyId: string; familyCode: string; isAdmin: boolean }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const copy = async () => {
    await navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await regenerateFamilyCodeAction(familyId);
      if (result.error) setError(result.error);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Family code</CardTitle>
        <CardDescription>
          Share this code so someone can request to join. You&apos;ll still need to approve them.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center gap-2">
          <span className="flex-1 rounded-md border border-linen-300 bg-linen-100 px-4 py-2.5 text-center font-mono text-xl tracking-widest text-dusk-700 dark:border-dusk-600 dark:bg-dusk-900 dark:text-linen-100">
            {familyCode}
          </span>
          <Button variant="outline" size="icon" onClick={copy} aria-label="Copy family code">
            {copied ? <Check className="h-4 w-4 animate-check-pop text-sage-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              onClick={regenerate}
              disabled={isPending}
              aria-label="Regenerate family code"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
