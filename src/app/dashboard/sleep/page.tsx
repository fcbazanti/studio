import SleepForm from './sleep-form';
import SleepChart from './sleep-chart';

export default function SleepPage() {
  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-2xl font-bold font-headline tracking-tight">Sleep Analysis</h2>
        <p className="text-muted-foreground">
          Monitor your sleep and get weekly recommendations.
        </p>
      </header>
      <SleepChart />
      <SleepForm />
    </div>
  );
}
