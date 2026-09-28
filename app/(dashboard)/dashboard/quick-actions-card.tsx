'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, HeartHandshake, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CreateEventDialog } from '@/app/(dashboard)/planner/create-event-dialog';
import { CreateReminderDialog } from '@/app/(dashboard)/reminders/create-reminder-dialog';
import { CheckInComposer } from '@/app/(dashboard)/reminders/check-in-composer';
import { InviteMemberDialog } from '@/app/(dashboard)/family/invite-member-dialog';
import { ROUTES } from '@/constants/routes';

function QuickCheckInDialog({ familyId }: { familyId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <HeartHandshake className="h-4 w-4" /> Post check-in
      </Button>
      <Modal open={open} onOpenChange={setOpen} title="Post a check-in">
        <div className="mt-2">
          <CheckInComposer familyId={familyId} />
        </div>
      </Modal>
    </>
  );
}

export function QuickActionsCard({
  familyId,
  isAdmin,
}: {
  familyId: string;
  isAdmin: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4" /> Quick actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <CreateEventDialog familyId={familyId} defaultDate={new Date()} />
        <CreateReminderDialog familyId={familyId} />
        <QuickCheckInDialog familyId={familyId} />
        {isAdmin && <InviteMemberDialog familyId={familyId} />}
        <Button variant="outline" asChild className="gap-2">
          <Link href={ROUTES.chat}>
            <MessageCircle className="h-4 w-4" /> Open chat
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
