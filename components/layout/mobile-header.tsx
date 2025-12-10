'use client';
import { useSidebar } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function MobileHeader() {
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isMobile) {
    return null;
  }

  return (
    <div className="flex items-center">
        <SidebarTrigger />
    </div>
  );
}
