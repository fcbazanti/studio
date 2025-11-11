'use client';

import { useState, useActionState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getSleepRecommendation } from './actions';
import { Loader2 } from 'lucide-react';

const initialState = {
  data: null,
  error: null,
};

export default function SleepForm() {
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeUpTime, setWakeUpTime] = useState('06:30');
  const [formState, formAction, isPending] = useActionState(getSleepRecommendation, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Sleep Times</CardTitle>
            <CardDescription>
              Provide your typical bedtime and wake-up time for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bedtime">Bedtime</Label>
              <Input
                id="bedtime"
                name="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wake-up">Wake-up Time</Label>
              <Input
                id="wake-up"
                name="wakeUpTime"
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze My Sleep
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      {formState.data && (
        <Card className="bg-primary/10 border-primary">
          <CardHeader>
            <CardTitle>Your Weekly Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{formState.data.weeklyRecommendation}</p>
          </CardContent>
        </Card>
      )}

      {formState.error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle>An Error Occurred</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{formState.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
