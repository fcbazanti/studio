'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Clock, ListTodo, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/todos', label: 'To-Do', icon: ListTodo },
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/time', label: 'Time', icon: Clock },
  { href: '/dashboard/sleep', label: 'Sleep', icon: Moon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex md:hidden z-50">
      <div className="flex w-full justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors duration-200',
                isActive && 'text-primary'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
