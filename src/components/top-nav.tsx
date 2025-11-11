'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ListTodo, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const navItems = [
  { href: '/dashboard/todos', label: 'To-Do', icon: ListTodo },
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/sleep', label: 'Sleep', icon: Moon },
];

export function TopNav() {
  const pathname = usePathname();

  // Find the current active tab. We check for the start of the href
  // to correctly highlight parent routes (e.g. /dashboard/todos).
  const activeTab = navItems.find((item) => pathname.startsWith(item.href))?.href ?? pathname;

  return (
    <nav className="sticky top-[73px] z-30 bg-background/80 backdrop-blur-sm shadow-sm -mt-px">
        <Tabs value={activeTab} className='w-full'>
            <TabsList className="w-full justify-around rounded-none">
                {navItems.map((item) => (
                    <TabsTrigger value={item.href} asChild key={item.href}>
                        <Link href={item.href}>
                            <item.icon className={cn("w-5 h-5 mr-2", pathname.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground')} />
                            {item.label}
                        </Link>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    </nav>
  );
}
