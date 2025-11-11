'use client';

import { useState } from 'react';
import type { Todo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isToday, isPast } from 'date-fns';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

export default function TodoList() {
  const { firestore } = useFirebase();
  const { user } = useUser();

  const todosQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'todos');
  }, [firestore, user]);

  const { data: todos, isLoading } = useCollection<Todo>(todosQuery);
  
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() && user) {
      const newTodo: any = {
        text: newTodoText.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid,
      };
      if (newTodoDueDate) {
        newTodo.dueDate = newTodoDueDate;
      }
      addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'todos'), newTodo);
      setNewTodoText('');
      setNewTodoDueDate(undefined);
      setIsDialogOpen(false);
    }
  };

  const toggleTodo = (id: string, completed: boolean) => {
    if (user) {
      const todoRef = doc(firestore, 'users', user.uid, 'todos', id);
      updateDocumentNonBlocking(todoRef, { completed: !completed });
    }
  };

  const clearCompleted = () => {
    if (user && todos) {
      const batch = writeBatch(firestore);
      todos.filter(todo => todo.completed).forEach(todo => {
        const todoRef = doc(firestore, 'users', user.uid, 'todos', todo.id);
        batch.delete(todoRef);
      });
      batch.commit().catch(error => {
        console.error("Chyba při mazání dokončených úkolů: ", error);
      });
    }
  };
  
  const getDueDateClass = (dueDate: Date) => {
    if (isToday(dueDate)) return "text-accent-foreground bg-accent";
    if (isPast(dueDate) && !isToday(dueDate)) return "text-destructive-foreground bg-destructive/80";
    return "text-muted-foreground bg-muted";
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          {isLoading && <p className="text-muted-foreground text-center p-4">Načítání úkolů...</p>}
          {!isLoading && todos && todos.length > 0 ? (
            todos.sort((a,b) => (a.dueDate as any) - (b.dueDate as any)).map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                  className="w-5 h-5"
                />
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={cn(
                    'flex-1 text-sm font-medium transition-colors',
                    todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}
                >
                  {todo.text}
                </label>
                {todo.dueDate && (
                  <div className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap", getDueDateClass(new Date((todo.dueDate as any).seconds * 1000)))}>
                    {format(new Date((todo.dueDate as any).seconds * 1000), 'd. MMM')}
                  </div>
                )}
              </div>
            ))
          ) : (
            !isLoading && <p className="text-muted-foreground text-center p-4">
              Váš seznam je prázdný. Přidejte úkol a začněte!
            </p>
          )}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1" variant="default" disabled={!user}>
              <Plus className="mr-2 h-4 w-4" />
              Přidat úkol
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Přidat nový úkol</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTodo} className="grid gap-4 py-4">
              <Input
                placeholder="Co je potřeba udělat?"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                autoFocus
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !newTodoDueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTodoDueDate ? format(newTodoDueDate, 'PPP') : <span>Vyberte datum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTodoDueDate}
                    onSelect={setNewTodoDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">Zrušit</Button>
                </DialogClose>
                <Button type="submit">Přidat úkol</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Button variant="destructive" size="icon" onClick={clearCompleted} disabled={!todos || !todos.some(t => t.completed)}>
          <Trash className="h-4 w-4" />
          <span className="sr-only">Smazat dokončené</span>
        </Button>
      </div>
    </div>
  );
}
