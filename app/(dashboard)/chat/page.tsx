import { createClient } from '@/lib/supabase/server';
import { getMyFamily, getFamilyMembers } from '@/services/families.service';
import { getMyChatThreads } from '@/services/chat.service';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { MessageCircle } from 'lucide-react';
import { ChatShell } from './chat-shell';

export default async function ChatPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { family } = await getMyFamily();

  if (!family) {
    return (
      <div>
        <PageHeader title="Chat" description="Private and family-wide conversations, in real time." />
        <EmptyState
          icon={<MessageCircle className="h-8 w-8" />}
          title="Set up your family first"
          description="Chat appears here once your family exists — head to the Family page to create one."
        />
      </div>
    );
  }

  const [members, threads] = await Promise.all([
    getFamilyMembers(family.id),
    getMyChatThreads(),
  ]);

  return (
    <div>
      <PageHeader title="Chat" description="Private and family-wide conversations, in real time." />
      <ChatShell
        threads={threads}
        familyId={family.id}
        members={members}
        currentUserId={user?.id ?? ''}
      />
    </div>
  );
}
