import { CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppIconProps = {
  className?: string;
};

export function AppIcon({ className }: AppIconProps) {
  return <CheckSquare className={cn('text-primary', className)} />;
}
