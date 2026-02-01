"use client";

import {
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrentTime } from "../utils/current-time";
import { OrgSwitcher } from "./org-switcher";
import { AccountMenu } from "./account-menu";

export default function Header() {
  return (
    <header>
      <div className="flex justify-between items-center px-6 py-3">
        <div>
          <Link href="/">
            <Image
              src="/assets/images/logo.svg"
              alt="Ticketly"
              width={32}
              height={32}
              className="block opacity-100 hover:opacity-80 transition-opacity duration-300 dark:hidden"
            />
            <Image
              src="/assets/images/logo-dark.svg"
              alt="Ticketly"
              width={32}
              height={32}
              className="hidden opacity-100 hover:opacity-80 transition-opacity duration-300 dark:block"
            />
          </Link>
        </div>

        <div>
          <div className="flex items-center gap-4">
            {/* <ThemeToggle /> */}

            <SignedOut>
              <CurrentTime />
              <Button asChild variant="default" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              {/* <Button asChild  size="xs">
                <Link href="/sign-up">Sign Up</Link>
              </Button> */}
            </SignedOut>

            <SignedIn>
              <Button asChild variant="ghost" size="sm" className="gap-2 text-gray-700 dark:text-gray-200">
                <Link href="/create">
                  <Plus className="h-4 w-4" />
                  Create event
                </Link>
              </Button>
              <OrgSwitcher />
              <AccountMenu />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
