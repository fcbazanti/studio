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

type SleepSchedule = {
  [key: string]: { bedtime: string; wakeUpTime: string };
};


function calculateSleepDuration(bedtime?: string, wakeUpTime?: string) {
  if (!bedtime || !wakeUpTime) {
    return 0;
  }
  try {
    const bedDate = parse(bedtime, 'HH:mm', new Date());
    let wakeDate = parse(wakeUpTime, 'HH:mm', new Date());

    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    return differenceInHours(wakeDate, bedDate);
  } catch(e) {
    return 0;
  }
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_MAP = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
}

export default function SleepChart({
  sleepSchedule,
}: {
  sleepSchedule?: SleepSchedule;
}) {

  const weeklyData = useMemo(() => {
    if (!sleepSchedule) return [];
    return DAYS.map((day) => {
        const schedule = sleepSchedule[day];
        const sleepHours = calculateSleepDuration(schedule?.bedtime, schedule?.wakeUpTime);
        return { day: DAY_MAP[day as keyof typeof DAY_MAP], hours: sleepHours };
    });
  }, [sleepSchedule]);

  const hasData = weeklyData.some(d => d.hours > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Sleep Duration</CardTitle>
        <CardDescription>
          Your estimated sleep hours based on your weekly schedule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis unit="h" domain={[0, 12]} allowDecimals={false}/>
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
              Please set your weekly sleep schedule below to see your sleep chart.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    