import TimeTools from './time-tools';

export default function TimePage() {
  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-2xl font-bold font-headline tracking-tight">Time Tools</h2>
        <p className="text-muted-foreground">Manage your time effectively.</p>
      </header>
      <TimeTools />
    </div>
  );
}
