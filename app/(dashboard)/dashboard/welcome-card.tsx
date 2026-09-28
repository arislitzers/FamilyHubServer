import { Card, CardContent } from '@/components/ui/card';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeCard({
  displayName,
  familyName,
}: {
  displayName: string;
  familyName: string;
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="overflow-hidden bg-dusk-gradient text-linen-100">
      <CardContent className="p-6">
        <p className="text-sm text-linen-300">{today}</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl">
          {getGreeting()}, {displayName}
        </h1>
        <p className="mt-1 text-linen-300">Here&apos;s what&apos;s happening with {familyName}.</p>
      </CardContent>
    </Card>
  );
}
