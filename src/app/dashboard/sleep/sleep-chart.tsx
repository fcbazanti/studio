'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const data = [
  { day: 'Mon', hours: 6.5 },
  { day: 'Tue', hours: 7 },
  { day: 'Wed', hours: 8 },
  { day: 'Thu', hours: 6 },
  { day: 'Fri', hours: 7.5 },
  { day: 'Sat', hours: 9 },
  { day: 'Sun', hours: 8.5 },
];

export default function SleepChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Sleep Duration</CardTitle>
        <CardDescription>Your sleep hours over the last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis unit="h" domain={[0, 12]}/>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="hours" fill="hsl(var(--primary))" name="Hours Slept" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
