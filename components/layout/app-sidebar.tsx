'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Package } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  
  if (pathname === '/login') return null;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <div className="p-2 bg-primary rounded-lg">
              <Package className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="font-bold text-xl text-sidebar-foreground">SS Engineering</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" passHref>
              <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Dashboard">
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/entries" passHref>
              <SidebarMenuButton isActive={isActive('/entries')} tooltip="Entries">
                <List />
                Entries
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2 bg-sidebar-border" />
        <p className="text-xs text-sidebar-foreground/50 px-4 pb-2">BizFlow v1.0</p>
      </SidebarFooter>
    </>
  );
}
