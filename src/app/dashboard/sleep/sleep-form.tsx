'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DaySchedule = {
  bedtime: string;
  wakeUpTime: string;
};

type SleepSchedule = {
  [key: string]: DaySchedule;
};

type UserProfile = {
  sleepSchedule?: SleepSchedule;
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES_CZ: { [key: string]: string } = {
  monday: 'Pondělí',
  tuesday: 'Úterý',
  wednesday: 'Středa',
  thursday: 'Čtvrtek',
  friday: 'Pátek',
  saturday: 'Sobota',
  sunday: 'Neděle'
};

const DEFAULT_SCHEDULE: SleepSchedule = DAYS.reduce((acc, day) => {
  acc[day] = { bedtime: '22:30', wakeUpTime: '06:30' };
  return acc;
}, {} as SleepSchedule);


export default function SleepForm({ userProfile }: { userProfile?: UserProfile }) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [schedule, setSchedule] = useState<SleepSchedule>(DEFAULT_SCHEDULE);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  useEffect(() => {
    if (userProfile?.sleepSchedule) {
      const completeSchedule = DAYS.reduce((acc, day) => {
        acc[day] = userProfile.sleepSchedule?.[day] || DEFAULT_SCHEDULE[day];
        return acc;
      }, {} as SleepSchedule);
      setSchedule(completeSchedule);
    }
  }, [userProfile]);

  const handleTimeChange = (day: string, type: 'bedtime' | 'wakeUpTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfileRef) return;
    setIsSaving(true);
    
    setDocumentNonBlocking(userProfileRef, { sleepSchedule: schedule }, { merge: true });

    toast({
      title: 'Plán uložen!',
      description: 'Váš nový spánkový plán byl uložen.',
    });
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Týdenní spánkový plán</CardTitle>
        <CardDescription>
          Nastavte si cílový čas spánku a vstávání pro každý den.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {DAYS.map(day => (
            <div key={day} className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor={`${day}-bedtime`} className="capitalize text-right">
                {DAY_NAMES_CZ[day]}
              </Label>
              <div className="space-y-1">
                <Label htmlFor={`${day}-bedtime`} className="text-xs text-muted-foreground">Spát</Label>
                <Input
                  id={`${day}-bedtime`}
                  type="time"
                  value={schedule[day]?.bedtime || ''}
                  onChange={(e) => handleTimeChange(day, 'bedtime', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${day}-wake`} className="text-xs text-muted-foreground">Vstávat</Label>
                <Input
                  id={`${day}-wake`}
                  type="time"
                  value={schedule[day]?.wakeUpTime || ''}
                  onChange={(e) => handleTimeChange(day, 'wakeUpTime', e.target.value)}
                />
              </div>
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Uložit plán
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
