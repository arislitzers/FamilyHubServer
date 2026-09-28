'use client';

import { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Camera } from 'lucide-react';
import { uploadAvatarAction } from './actions';

function TriggerButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="Change photo"
      className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-hearth-400 text-white shadow-soft transition-colors hover:bg-hearth-500 disabled:opacity-60"
    >
      <Camera className="h-3 w-3" />
    </button>
  );
}

export function AvatarUploader() {
  const [, formAction] = useFormState(uploadAvatarAction, { error: null });
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="absolute inset-0">
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/*"
        className="hidden"
        onChange={() => formRef.current?.requestSubmit()}
      />
      <TriggerButton onClick={() => inputRef.current?.click()} />
    </form>
  );
}
