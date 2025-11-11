'use client';

import { useState } from 'react';
import type { CalendarEvent } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isSameDay, format } from 'date-fns';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

export default function CalendarView() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'calendarEvents');
  }, [firestore, user]);

  const { data: events, isLoading } = useCollection<CalendarEvent>(eventsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventRepeat, setNewEventRepeat] = useState('none');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && date && user) {
      const newEvent = {
        title: newEventTitle,
        startTime: new Date(`${format(date, 'yyyy-MM-dd')}T${newEventStartTime}`),
        endTime: new Date(`${format(date, 'yyyy-MM-dd')}T${newEventEndTime}`),
        recurringRule: newEventRepeat,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'calendarEvents'), newEvent);
      setNewEventTitle('');
      setNewEventStartTime('');
      setNewEventEndTime('');
      setNewEventRepeat('none');
      setIsDialogOpen(false);
    }
  };
  
  const handleDeleteEvent = (eventId: string) => {
    if(user) {
      deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'calendarEvents', eventId));
    }
  }

  const todaysEvents = events?.filter((event) =>
    date ? isSameDay(new Date((event.startTime as any).seconds * 1000), date) : false
  ) || [];

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
            <Button size="sm" disabled={!user}>
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
                  <Input id="start-time" type="time" value={newEventStartTime} onChange={(e) => setNewEventStartTime(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input id="end-time" type="time" value={newEventEndTime} onChange={(e) => setNewEventEndTime(e.target.value)} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat">Repeat</Label>
                <Select value={newEventRepeat} onValueChange={setNewEventRepeat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Does not repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
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
        {isLoading && <p className="text-muted-foreground text-center pt-4">Loading events...</p>}
        {!isLoading && todaysEvents.length > 0 ? (
          todaysEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-20 text-sm text-muted-foreground text-right mr-3">
                    <p>{format(new Date((event.startTime as any).seconds * 1000), 'p')}</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date((event.startTime as any).seconds * 1000), 'p')} - {format(new Date((event.endTime as any).seconds * 1000), 'p')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                  <Trash className="w-4 h-4 text-destructive" />
                  <span className="sr-only">Delete event</span>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-center pt-4">No events for this day.</p>
        )}
      </div>
    </div>
  );
}
