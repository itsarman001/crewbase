"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { RoleBadge } from "@/components/shared/role-badge";
import { mockCurrentUser } from "@/data/mock";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShieldAlert,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const currentUser = mockCurrentUser;

  // Filter navigation items based on current user's role
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(currentUser.role)
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-border/70 p-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            <span className="text-base tracking-wider">CB</span>
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Crewbase
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              RBAC Platform
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const IconComponent = ICON_MAP[item.icon] ?? LayoutDashboard;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="gap-2.5 h-9 rounded-md font-medium text-sm transition-colors text-muted-foreground hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <IconComponent className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Account & System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/profile" />}
                  isActive={pathname === "/profile"}
                  tooltip="User Profile"
                  className="gap-2.5 h-9 rounded-md font-medium text-sm text-muted-foreground hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                >
                  <UserIcon className="size-4 shrink-0" />
                  <span className="truncate">Profile & Security</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/system-states" />}
                  isActive={pathname === "/system-states"}
                  tooltip="System States Preview"
                  className="gap-2.5 h-9 rounded-md font-medium text-sm text-muted-foreground hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                >
                  <ShieldCheck className="size-4 shrink-0" />
                  <span className="truncate">System States</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/70 p-3">
        <div className="flex items-center gap-3 p-1.5 rounded-lg bg-card/60 border border-border group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs shrink-0">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-foreground truncate">
              {currentUser.name}
            </span>
            <div className="mt-0.5">
              <RoleBadge role={currentUser.role} size="sm" />
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
