'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Slim banner that appears whenever the browser goes offline. Mount it
 * once near the root of the dashboard shell.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    setIsOffline(!navigator.onLine);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-hearth-500 px-4 py-2 text-center text-xs font-medium text-white">
      <WifiOff className="h-3.5 w-3.5" />
      You&apos;re offline — some features may not work until you reconnect.
    </div>
  );
}
