"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Directory & Users",
  "/teams": "Squads & Teams",
  "/roles": "Roles & Access Control",
  "/profile": "Profile & Security",
  "/system-states": "System States Preview",
};

export function Header() {
  const pathname = usePathname();
  const currentTitle = ROUTE_NAMES[pathname] || "Workspace";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-xs px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <div className="h-4 w-px bg-border" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
                Crewbase
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-medium text-foreground">
                {currentTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block w-56 lg:w-64">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search roster or teams..."
            className="h-8 pl-8 text-xs bg-muted/40 border-border"
          />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
