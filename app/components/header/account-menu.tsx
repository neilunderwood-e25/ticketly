"use client";

import * as React from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

function initialsFromName(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

export function AccountMenu() {
  const { isLoaded, user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [open, setOpen] = React.useState(false);

  const name = user?.fullName || user?.firstName || "Account";
  const email = user?.primaryEmailAddress?.emailAddress || "";

  async function onSignOut() {
    await signOut({ redirectUrl: "/" });
  }

  if (!isLoaded) {
    return (
      <Button variant="outline" size="icon-sm" disabled aria-label="Account">
        <UserIcon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Account menu">
          <Avatar size="sm" className="h-6 w-6">
            <AvatarImage src={user?.imageUrl} alt="" />
            <AvatarFallback>{initialsFromName(name)}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <PopoverHeader className="p-2">
          <PopoverTitle className="truncate">{name}</PopoverTitle>
          {email ? (
            <PopoverDescription className="truncate">{email}</PopoverDescription>
          ) : null}
        </PopoverHeader>

        <Separator className="mb-2" />

        <div className="flex flex-col gap-1 px-2 pb-2">
          <Button
            type="button"
            variant="ghost"
            className="justify-start"
            onClick={() => {
              setOpen(false);
              openUserProfile();
            }}
          >
            <UserIcon className="h-4 w-4" />
            Manage account
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="justify-start text-sm text-destructive hover:text-destructive"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

