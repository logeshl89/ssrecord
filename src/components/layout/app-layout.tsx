'use client';
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { DataProvider } from '@/components/data-provider';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <DataProvider>
      <SidebarProvider>
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  );
}