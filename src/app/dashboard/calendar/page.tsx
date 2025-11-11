import CalendarView from './calendar-view';

export default function CalendarPage() {
  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-2xl font-bold font-headline tracking-tight">
          Calendar
        </h2>
        <p className="text-muted-foreground">
          Plan your events and stay organized.
        </p>
      </header>
      <CalendarView />
    </div>
  );
}
