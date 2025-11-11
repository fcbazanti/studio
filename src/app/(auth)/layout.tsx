import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AppIcon } from '@/components/app-icon';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgImage = PlaceHolderImages.find(img => img.id === 'auth-background');

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover -z-10"
          data-ai-hint={bgImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm -z-10" />

      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <AppIcon className="w-16 h-16" />
        <h1 className="text-4xl font-bold text-foreground font-headline">
          My Day
        </h1>
        <p className="text-lg text-muted-foreground">
          Plan your day, your way.
        </p>
      </div>

      {children}
    </main>
  );
}
