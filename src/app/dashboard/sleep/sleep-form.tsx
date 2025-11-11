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
      // Ensure all days are present, falling back to default if not.
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
      title: 'Schedule Saved!',
      description: 'Your new sleep schedule has been saved.',
    });
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Sleep Schedule</CardTitle>
        <CardDescription>
          Set your target bedtime and wake-up time for each day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {DAYS.map(day => (
            <div key={day} className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor={`${day}-bedtime`} className="capitalize text-right">
                {day}
              </Label>
              <div className="space-y-1">
                <Label htmlFor={`${day}-bedtime`} className="text-xs text-muted-foreground">Bedtime</Label>
                <Input
                  id={`${day}-bedtime`}
                  type="time"
                  value={schedule[day]?.bedtime || ''}
                  onChange={(e) => handleTimeChange(day, 'bedtime', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${day}-wake`} className="text-xs text-muted-foreground">Wake up</Label>
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
            Save Schedule
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

    