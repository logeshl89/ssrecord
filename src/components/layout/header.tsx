'use client';
import { MobileHeader } from './mobile-header';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-sidebar text-sidebar-foreground px-4 sm:px-6">
      <MobileHeader />
      <div className="flex-1"></div>
      <UserNav />
    </header>
  );
}
