import CalendarView from './calendar-view';

export default function CalendarPage() {
  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-2xl font-bold font-headline tracking-tight">
          Kalendář
        </h2>
        <p className="text-muted-foreground">
          Plánujte své události a zůstaňte organizovaní.
        </p>
      </header>
      <CalendarView />
    </div>
  );
}
