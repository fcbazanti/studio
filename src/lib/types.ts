import { Timestamp } from "firebase/firestore";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date | Timestamp;
  createdAt: Timestamp;
  userId: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  recurringRule: string;
  userId: string;
  createdAt: Timestamp;
};
