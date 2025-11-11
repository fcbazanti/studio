'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { updateProfile } from 'firebase/auth';

export default function SignupPage() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (!isUserLoading && user) {
      const userProfileRef = doc(firestore, 'users', user.uid);
      const profileData = {
        firstName,
        lastName,
        email: user.email,
        registrationDate: new Date().toISOString(),
      };
      setDocumentNonBlocking(userProfileRef, profileData, { merge: true });

      if (auth.currentUser) {
        updateProfile(auth.currentUser, { displayName: `${firstName} ${lastName}`.trim() });
      }

      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router, firestore, auth, firstName, lastName]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignUp(auth, email, password);
  };

  if (isUserLoading || user) {
    return <p>Načítání...</p>;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Zaregistrovat se</CardTitle>
        <CardDescription>
          Zadejte své údaje pro vytvoření účtu
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">Křestní jméno</Label>
              <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Příjmení</Label>
              <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Heslo</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full mt-2">
             Vytvořit účet
          </Button>
        </CardContent>
      </form>
      <CardHeader className="pt-0 text-center text-sm">
        Už máte účet?{' '}
        <Link href="/login" className="underline">
          Přihlásit se
        </Link>
      </CardHeader>
    </Card>
  );
}
