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
const DAY_MAP_CZ = {
    monday: 'Po',
    tuesday: 'Út',
    wednesday: 'St',
    thursday: 'Čt',
    friday: 'Pá',
    saturday: 'So',
    sunday: 'Ne'
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
        return { day: DAY_MAP_CZ[day as keyof typeof DAY_MAP_CZ], hours: sleepHours };
    });
  }, [sleepSchedule]);

  const hasData = weeklyData.some(d => d.hours > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Týdenní délka spánku</CardTitle>
        <CardDescription>
          Vaše odhadované hodiny spánku na základě vašeho týdenního plánu.
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
                name="Prospané hodiny"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground p-8">
            <p>
              Nastavte si prosím svůj týdenní spánkový plán níže, abyste viděli svůj graf spánku.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
