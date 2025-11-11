'use client';

import { useState } from 'react';
import type { CalendarEvent } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isSameDay, format } from 'date-fns';

const initialEvents: CalendarEvent[] = [
  { id: '1', title: 'Design Review', date: new Date(), startTime: '10:00', endTime: '11:00' },
  { id: '2', title: 'Lunch with Sarah', date: new Date(), startTime: '12:30', endTime: '13:30' },
  { id: '3', title: 'Doctor Appointment', date: new Date(new Date().setDate(new Date().getDate() + 2)), startTime: '15:00', endTime: '15:30' },
];

export default function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && date) {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: newEventTitle,
        date: date,
        startTime: newEventStartTime,
        endTime: newEventEndTime,
      };
      setEvents([...events, newEvent]);
      setNewEventTitle('');
      setNewEventStartTime('');
      setNewEventEndTime('');
      setIsDialogOpen(false);
    }
  };

  const todaysEvents = events.filter((event) =>
    date ? isSameDay(event.date, date) : false
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full"
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Events for {date ? format(date, 'MMMM d') : '...'}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Event for {date ? format(date, 'MMMM d') : ''}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input id="start-time" type="time" value={newEventStartTime} onChange={(e) => setNewEventStartTime(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input id="end-time" type="time" value={newEventEndTime} onChange={(e) => setNewEventEndTime(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {todaysEvents.length > 0 ? (
          todaysEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-3 flex items-center">
                <div className="w-16 text-sm text-muted-foreground text-right mr-3">
                  <p>{event.startTime}</p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.startTime} - {event.endTime}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center pt-4">No events for this day.</p>
        )}
      </div>
    </div>
  );
}
