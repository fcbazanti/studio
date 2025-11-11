'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { differenceInHours, parse } from 'date-fns';
import Link from 'next/link';

function calculateSleepDuration(bedtime?: string, wakeUpTime?: string) {
  if (!bedtime || !wakeUpTime) {
    return 0;
  }
  const bedDate = parse(bedtime, 'HH:mm', new Date());
  let wakeDate = parse(wakeUpTime, 'HH:mm', new Date());

  // If wake up time is the next day
  if (wakeDate < bedDate) {
    wakeDate.setDate(wakeDate.getDate() + 1);
  }

  return differenceInHours(wakeDate, bedDate);
}

export default function SleepChart({
  bedtime,
  wakeUpTime,
}: {
  bedtime?: string;
  wakeUpTime?: string;
}) {
  const weeklyData = useMemo(() => {
    const sleepHours = calculateSleepDuration(bedtime, wakeUpTime);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({ day, hours: sleepHours }));
  }, [bedtime, wakeUpTime]);

  const hasData = bedtime && wakeUpTime;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Sleep Duration</CardTitle>
        <CardDescription>
          Your estimated sleep hours based on your default times.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis unit="h" domain={[0, 12]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Legend />
              <Bar
                dataKey="hours"
                fill="hsl(var(--primary))"
                name="Hours Slept"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground p-8">
            <p>
              Please set your default bedtime and wake-up time in your{' '}
              <Link href="/dashboard/account" className="underline text-primary">
                account settings
              </Link>{' '}
              to see your sleep chart.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
