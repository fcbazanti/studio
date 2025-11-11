'use client';
import { TopNav } from '@/components/top-nav';
import { AppIcon } from '@/components/app-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Načítání...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full min-h-full bg-muted/40">
      <div className="flex flex-col w-full max-w-md bg-background shadow-lg">
        <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-2">
                <AppIcon className="w-8 h-8"/>
                <h1 className="text-xl font-bold font-headline text-foreground">My Day</h1>
            </div>
            <Link href="/dashboard/account">
              <Avatar>
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName ?? "User"} data-ai-hint="person face" />
                <AvatarFallback>
                  {user.photoURL ? user.email?.charAt(0).toUpperCase() : <User className="w-5 h-5 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>
            </Link>
        </header>
        <TopNav />
        <main className="flex-1 overflow-y-auto md:pb-4">{children}</main>
      </div>
    </div>
  );
}
