"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrgSwitcher() {
  const { organization } = useOrganization();
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const memberships = userMemberships?.data ?? [];
  const activeOrgId = organization?.id ?? null;
  const activeOrgName = organization?.name ?? "Select organization";
  const activeOrgImageUrl = organization?.imageUrl ?? "";

  async function onSelectOrg(orgId: string) {
    if (!setActive) return;
    await setActive({ organization: orgId });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button" 
          variant="ghost"
          size="sm"
          disabled={!isLoaded}
          className="gap-2"
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={activeOrgImageUrl} alt="" />
            <AvatarFallback>{activeOrgName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[160px] truncate">
            {activeOrgName}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[260px]">
        {memberships.length === 0 ? (
          <DropdownMenuItem asChild>
            <Link href="/onboarding" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create organization
            </Link>
          </DropdownMenuItem>
        ) : (
          <>
            {memberships.map((m) => {
              const org = m.organization;
              const isActive = org.id === activeOrgId;

              return (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => onSelectOrg(org.id)}
                  className={isActive ? "bg-accent" : undefined}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={org.imageUrl} alt="" />
                      <AvatarFallback>{org.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{org.name}</div>
                    </div>
                    {isActive ? (
                      <span className="text-xs text-muted-foreground">Active</span>
                    ) : null}
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/onboarding" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create organization
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

