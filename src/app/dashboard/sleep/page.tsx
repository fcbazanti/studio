'use client';

import SleepForm from './sleep-form';
import SleepChart from './sleep-chart';
import { useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useActionState } from 'react';
import { getSleepRecommendation } from './actions';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

type SleepSchedule = {
  [key: string]: { bedtime: string; wakeUpTime: string };
};

type UserProfile = {
  sleepSchedule?: SleepSchedule;
};

const initialState = {
  data: null,
  error: null,
};

export default function SleepPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  const [formState, formAction, isPending] = useActionState(
    getSleepRecommendation,
    initialState
  );

  const sleepScheduleString = useMemo(() => {
    if (!userProfile?.sleepSchedule) return '';
    try {
      return JSON.stringify(userProfile.sleepSchedule);
    } catch (e) {
      return '';
    }
  }, [userProfile?.sleepSchedule]);


  if (isProfileLoading) {
    return <p>Načítání...</p>;
  }

  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-2xl font-bold font-headline tracking-tight">
          Analýza spánku
        </h2>
        <p className="text-muted-foreground">
          Sledujte svůj spánek a získejte týdenní doporučení.
        </p>
      </header>
      <SleepChart sleepSchedule={userProfile?.sleepSchedule} />
      
      <SleepForm userProfile={userProfile} />

      <div className="space-y-4">
        <form action={formAction}>
          <input
            type="hidden"
            name="sleepSchedule"
            value={sleepScheduleString}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !userProfile?.sleepSchedule}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyzovat můj spánek
          </Button>
        </form>

        {formState.data && (
          <Card className="bg-primary/10 border-primary">
            <CardHeader>
              <CardTitle>Vaše týdenní doporučení</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                {formState.data.weeklyRecommendation}
              </p>
            </CardContent>
          </Card>
        )}

        {formState.error && (
          <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle>Vyskytla se chyba</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{formState.error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
