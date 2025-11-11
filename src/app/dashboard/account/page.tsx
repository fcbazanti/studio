'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-2xl font-bold font-headline tracking-tight">
          My Account
        </h2>
        <p className="text-muted-foreground">
          View and edit your profile information.
        </p>
      </header>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.photoURL || "https://picsum.photos/seed/user/128/128"} alt="User" data-ai-hint="person face" />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full bg-background"
              >
                <Camera className="w-5 h-5" />
                <span className="sr-only">Change profile picture</span>
              </Button>
            </div>
            <div className='text-center'>
                <h3 className="text-2xl font-bold">{user.displayName || 'User'}</h3>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user.displayName?.split(' ')[0]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user.displayName?.split(' ')[1]} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" />
            </div>
            
            <Button type="submit" className="w-full">Save Changes</Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>Log Out</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
