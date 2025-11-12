import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Day',
  description: 'Naplánujte si svůj den po svém.',
  manifest: '/manifest.json',
};

export default function RootPage() {
  redirect('/login');
}
