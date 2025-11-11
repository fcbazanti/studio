'use client';

import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';

// A function to format time in HH:MM:SS.ms
const formatTime = (time: number) => {
  const ms = Math.floor((time % 1000) / 10);
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - time;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stopwatch</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <p className="text-5xl font-mono font-bold tracking-tighter">{formatTime(time)}</p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button onClick={handleStartPause} size="icon" className="w-16 h-16 rounded-full">
          {isRunning ? <Pause /> : <Play />}
        </Button>
        <Button onClick={handleReset} size="icon" variant="outline" className="w-16 h-16 rounded-full">
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  );
}

function Timer() {
    const [initialTime, setInitialTime] = useState(300); // 5 minutes in seconds
    const [time, setTime] = useState(initialTime * 1000);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let expected: number;
        if (isRunning) {
            expected = Date.now() + 1000;
            timerRef.current = setTimeout(tick, 1000);
        }
    
        function tick() {
            const drift = Date.now() - expected;
            if (drift > 1000) {
              // Adjust for drift
            }
            setTime(t => {
                if (t <= 1000) {
                    setIsRunning(false);
                    return 0;
                }
                return t - 1000;
            });
            expected += 1000;
            if(isRunning) {
                timerRef.current = setTimeout(tick, Math.max(0, 1000 - drift));
            }
        }
    
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isRunning]);
    
    useEffect(() => {
        setTime(initialTime * 1000);
    }, [initialTime]);


    const handleStartPause = () => {
        if (time > 0) {
            setIsRunning(!isRunning);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(initialTime * 1000);
    };

    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Timer</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center flex-col items-center gap-4">
                 <div className="flex gap-2">
                    <Button variant={initialTime === 60 ? "default" : "outline"} onClick={() => setInitialTime(60)}>1 min</Button>
                    <Button variant={initialTime === 300 ? "default" : "outline"} onClick={() => setInitialTime(300)}>5 min</Button>
                    <Button variant={initialTime === 600 ? "default" : "outline"} onClick={() => setInitialTime(600)}>10 min</Button>
                 </div>
                <p className="text-5xl font-mono font-bold tracking-tighter">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
                <Button onClick={handleStartPause} size="icon" className="w-16 h-16 rounded-full" disabled={time === 0}>
                    {isRunning ? <Pause /> : <Play />}
                </Button>
                <Button onClick={handleReset} size="icon" variant="outline" className="w-16 h-16 rounded-full">
                    <RotateCcw />
                </Button>
            </CardFooter>
        </Card>
    );
}

function Alarm() {
  const [alarmTime, setAlarmTime] = useState('07:30');
  const [isAlarmSet, setIsAlarmSet] = useState(false);

  const handleSetAlarm = () => {
    setIsAlarmSet(true);
    // In a real app, you would schedule a notification here.
    // For now, we just show a state.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alarm</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Input
          type="time"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
          className="w-48 text-lg"
        />
        {isAlarmSet && <p className="text-accent">Alarm is set for {alarmTime}.</p>}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={handleSetAlarm}>
          <TimerIcon className="mr-2 h-4 w-4" />
          {isAlarmSet ? 'Update Alarm' : 'Set Alarm'}
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function TimeTools() {
  return (
    <Tabs defaultValue="stopwatch" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="alarm">Alarm</TabsTrigger>
        <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
        <TabsTrigger value="timer">Timer</TabsTrigger>
      </TabsList>
      <TabsContent value="alarm" className="mt-4">
        <Alarm />
      </TabsContent>
      <TabsContent value="stopwatch" className="mt-4">
        <Stopwatch />
      </TabsContent>
      <TabsContent value="timer" className="mt-4">
        <Timer />
      </TabsContent>
    </Tabs>
  );
}
