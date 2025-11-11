export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
};
