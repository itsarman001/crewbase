"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/shared/role-badge";
import { useAuth } from "@/components/auth/auth-provider";
import { User as UserIcon, LogOut, ShieldCheck, Loader2 } from "lucide-react";
import { Role } from "@/types";

export function UserNav() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="size-8 rounded-full bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" render={<Link href="/login" />}>
        Sign In
      </Button>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="relative size-8 rounded-full p-0" />}>
        <Avatar className="size-8 rounded-full border border-border">
          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
              <RoleBadge role={user.role} size="sm" />
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full" />}>
            <UserIcon className="size-4 text-muted-foreground" />
            <span>Profile & Account</span>
          </DropdownMenuItem>
          {user.role === Role.ADMIN && (
            <DropdownMenuItem render={<Link href="/roles" className="flex items-center gap-2 cursor-pointer w-full" />}>
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span>Access Entitlements</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="size-4 mr-2" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
