'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

type Step = 'loading' | 'disabled' | 'enrolling' | 'enabled';

/**
 * Real TOTP enrollment via Supabase Auth's built-in MFA support
 * (supabase.auth.mfa.*) — no third-party 2FA library or extra backend
 * needed, since Supabase already implements the TOTP secret generation,
 * QR code, and verification server-side. This component is just a UI
 * around that existing API.
 */
export function TwoFactorCard() {
  const [step, setStep] = useState<Step>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  const refreshStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setError(error.message);
      setStep('disabled');
      return;
    }
    const verified = data.totp.find((f) => f.status === 'verified');
    if (verified) {
      setFactorId(verified.id);
      setStep('enabled');
    } else {
      setStep('disabled');
    }
  };

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEnrollment = async () => {
    setError(null);
    setBusy(true);

    // Clean up any abandoned, never-verified enrollment attempt first —
    // Supabase won't let you enroll a second TOTP factor while an
    // unverified one already exists.
    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const factor of existing?.totp ?? []) {
      if (factor.status !== 'verified') {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStep('enrolling');
  };

  const verifyEnrollment = async () => {
    if (!factorId || code.trim().length !== 6) return;
    setError(null);
    setBusy(true);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError(challengeError.message);
      setBusy(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    setBusy(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setCode('');
    setStep('enabled');
  };

  const cancelEnrollment = async () => {
    if (factorId) await supabase.auth.mfa.unenroll({ factorId });
    setFactorId(null);
    setQrCode(null);
    setSecret(null);
    setCode('');
    setError(null);
    setStep('disabled');
  };

  const disable2fa = async () => {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    setFactorId(null);
    setStep('disabled');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" /> Two-factor authentication
          </CardTitle>
          <CardDescription>
            Require a code from an authenticator app in addition to your password.
          </CardDescription>
        </div>
        {step === 'enabled' && (
          <Badge variant="success" className="gap-1">
            <ShieldCheck className="h-3 w-3" /> Enabled
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'loading' && <p className="text-sm text-dusk-300 dark:text-dusk-500">Loading...</p>}

        {step === 'disabled' && (
          <Button onClick={startEnrollment} disabled={busy} className="w-fit gap-2">
            <ShieldCheck className="h-4 w-4" /> Turn on two-factor authentication
          </Button>
        )}

        {step === 'enrolling' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-dusk-500 dark:text-dusk-200">
              Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password,
              etc.), then enter the 6-digit code it shows.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              {qrCode && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCode}
                  alt="Two-factor authentication QR code"
                  className="h-40 w-40 rounded-md border border-linen-300 dark:border-dusk-600"
                />
              )}
              <div className="flex flex-col gap-2">
                {secret && (
                  <div>
                    <p className="text-xs text-dusk-400 dark:text-dusk-300">
                      Can&apos;t scan? Enter this code manually:
                    </p>
                    <p className="rounded-md bg-linen-200 px-2 py-1 font-mono text-xs text-dusk-700 dark:bg-dusk-900 dark:text-linen-100">
                      {secret}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="totp-code" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                    6-digit code
                  </label>
                  <input
                    id="totp-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    placeholder="123456"
                    className="h-10 w-32 rounded-md border border-linen-300 bg-white px-3 text-center font-mono text-lg tracking-widest text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelEnrollment} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={verifyEnrollment} disabled={busy || code.length !== 6}>
                {busy ? 'Verifying...' : 'Verify and enable'}
              </Button>
            </div>
          </div>
        )}

        {step === 'enabled' && (
          <Button
            variant="outline"
            onClick={disable2fa}
            disabled={busy}
            className="w-fit gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <ShieldOff className="h-4 w-4" /> {busy ? 'Turning off...' : 'Turn off two-factor authentication'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
