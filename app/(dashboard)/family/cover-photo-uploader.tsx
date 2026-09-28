'use client';

import { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Camera } from 'lucide-react';
import { uploadFamilyCoverAction } from './actions';

function TriggerButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-md bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55"
    >
      <Camera className="h-3.5 w-3.5" /> {pending ? 'Uploading...' : 'Change cover'}
    </button>
  );
}

export function CoverPhotoUploader({ familyId }: { familyId: string }) {
  const [, formAction] = useFormState(uploadFamilyCoverAction, { error: null });
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="familyId" value={familyId} />
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
