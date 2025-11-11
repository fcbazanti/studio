import { BottomNav } from '@/components/bottom-nav';
import { AppIcon } from '@/components/app-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center w-full min-h-full bg-muted/40">
      <div className="flex flex-col w-full max-w-md bg-background shadow-lg">
        <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-2">
                <AppIcon className="w-8 h-8"/>
                <h1 className="text-xl font-bold font-headline text-foreground">Verdant Day</h1>
            </div>
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User" data-ai-hint="person face" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
        </header>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-4">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
