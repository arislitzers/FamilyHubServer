'use client';

import { useState, useTransition } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exportMyDataAction } from './actions';

export function ExportDataButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const exportData = () => {
    setError(null);
    startTransition(async () => {
      const result = await exportMyDataAction();
      if (result.error || !result.data) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }

      const blob = new Blob([result.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `familyhub-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button variant="outline" onClick={exportData} disabled={isPending} className="w-fit gap-2">
        <Download className="h-4 w-4" /> {isPending ? 'Preparing...' : 'Export my data'}
      </Button>
    </div>
  );
}
