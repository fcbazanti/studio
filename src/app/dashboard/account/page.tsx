'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  firstName?: string;
  lastName?: string;
  age?: number;
  address?: string;
};

export default function AccountPage() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || user?.displayName?.split(' ')[0] || '');
      setLastName(userProfile.lastName || user?.displayName?.split(' ')[1] || '');
      setAge(userProfile.age?.toString() || '');
      setAddress(userProfile.address || '');
    } else if (user) {
        setFirstName(user.displayName?.split(' ')[0] || '');
        setLastName(user.displayName?.split(' ')[1] || '');
    }
  }, [userProfile, user]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfileRef) return;

    setIsSaving(true);
    const newDisplayName = `${firstName} ${lastName}`.trim();
    
    const profileData: UserProfile = {
        firstName,
        lastName,
        age: age ? parseInt(age, 10) : undefined,
        address,
    };

    try {
      // Update Firestore document
      setDocumentNonBlocking(userProfileRef, profileData, { merge: true });

      // Update auth profile
      if (auth.currentUser && auth.currentUser.displayName !== newDisplayName) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName });
      }
      
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });

    } catch (error) {
      console.error("Error updating profile: ", error);
       toast({
        variant: "destructive",
        title: 'Uh oh!',
        description: 'There was a problem saving your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isUserLoading || isProfileLoading) {
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

          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>Log Out</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
