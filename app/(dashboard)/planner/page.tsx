import { CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMyFamily } from '@/services/families.service';
import { getPlannerEvents } from '@/services/planner.service';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { addDays, fromDateParam, startOfDay, startOfMonthGrid, startOfWeek } from '@/lib/date-utils';
import { WeekView } from './week-view';
import { DayView } from './day-view';
import { MonthView } from './month-view';
import { ViewSwitcher } from './view-switcher';

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: { view?: string; week?: string; date?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { family, myRole } = await getMyFamily();

  if (!family) {
    return (
      <div>
        <PageHeader title="Planner" description="A shared weekly view of everything your family has going on." />
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" />}
          title="Set up your family first"
          description="The planner appears here once your family exists — head to the Family page to create one."
        />
      </div>
    );
  }

  const isAdmin = myRole === 'owner' || myRole === 'admin';
  const view = searchParams.view === 'day' || searchParams.view === 'month' ? searchParams.view : 'week';

  const weekStart = startOfWeek(fromDateParam(searchParams.week));
  const selectedDate = fromDateParam(searchParams.date);
  const monthAnchor = selectedDate;

  let rangeStart: Date;
  let rangeEnd: Date;

  if (view === 'day') {
    rangeStart = startOfDay(selectedDate);
    rangeEnd = addDays(rangeStart, 1);
  } else if (view === 'month') {
    rangeStart = startOfMonthGrid(monthAnchor);
    rangeEnd = addDays(rangeStart, 42);
  } else {
    rangeStart = weekStart;
    rangeEnd = addDays(weekStart, 7);
  }

  const events = await getPlannerEvents(family.id, rangeStart, rangeEnd);
  const currentUserId = user?.id ?? '';

  return (
    <div>
      <PageHeader
        title="Planner"
        description={`Everything ${family.name} has going on.`}
        actions={<ViewSwitcher activeView={view} />}
      />

      {view === 'day' && (
        <DayView
          date={selectedDate}
          events={events}
          familyId={family.id}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}

      {view === 'month' && (
        <MonthView
          monthDate={monthAnchor}
          events={events}
          familyId={family.id}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}

      {view === 'week' && (
        <WeekView
          weekStart={weekStart}
          events={events}
          familyId={family.id}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
