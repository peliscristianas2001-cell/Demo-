import Link from 'next/link';
import { MountainSnow } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <MountainSnow className="h-7 w-7 text-primary" />
      <span className="text-2xl font-bold tracking-tight text-foreground font-headline">
        YO TE LLEVO
      </span>
    </Link>
  );
}
