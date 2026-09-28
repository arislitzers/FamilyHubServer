'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastMessage, ToastVariant } from '@/types/ui.types';

interface ToastContextValue {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantIcon: Record<ToastVariant, ReactNode> = {
  default: <Info className="h-5 w-5 text-dusk-400" />,
  success: <CheckCircle2 className="h-5 w-5 text-sage-500" />,
  destructive: <AlertTriangle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-hearth-500" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { ...message, id }]);
  }, []);

  const dismiss = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {messages.map(({ id, title, description, variant = 'default' }) => (
          <ToastPrimitive.Root
            key={id}
            onOpenChange={(open) => !open && dismiss(id)}
            className={cn(
              'flex items-start gap-3 rounded-md border border-linen-300 bg-white p-4 shadow-lifted dark:border-dusk-600 dark:bg-dusk-800',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full data-[swipe=end]:slide-out-to-right-full duration-200'
            )}
          >
            {variantIcon[variant]}
            <div className="grid gap-0.5">
              <ToastPrimitive.Title className="text-sm font-medium text-dusk-700 dark:text-linen-100">
                {title}
              </ToastPrimitive.Title>
              {description && (
                <ToastPrimitive.Description className="text-sm text-dusk-400 dark:text-dusk-200">
                  {description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="ml-auto text-dusk-400 hover:text-dusk-600 dark:text-dusk-300">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] m-0 flex w-full max-w-sm list-none flex-col gap-2 p-6 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
