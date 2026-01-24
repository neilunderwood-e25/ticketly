"use client";

import {
  SignedIn,
  SignedOut,
  UserButton,
  OrganizationSwitcher,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CurrentTime } from "../utils/current-time";

export default function Header() {
  const { user } = useUser();

  return (
    <header>
      <div className="flex justify-between items-center px-6 py-3">
        <div>
          <Link href="#">
            <Image src="/assets/images/logo.svg" alt="Ticketly" width={32} height={32} className="opacity-100 hover:opacity-80 transition-opacity duration-300" />
          </Link>
        </div>

        <div>
          <SignedOut>
            <div className="flex items-center gap-4">
              <CurrentTime />
              <Button asChild variant="default" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              {/* <Button asChild  size="xs">
                <Link href="/sign-up">Sign Up</Link>
              </Button> */}
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <OrganizationSwitcher
                hidePersonal
                appearance={{
                  elements: {
                    organizationSwitcherTrigger: "!text-sm !text-gray-700 !font-sans",
                    organizationPreviewMainIdentifier: "!text-sm !text-gray-700 !font-sans",
                  },
                }}
              />
              {/* <span className="text-sm font-medium text-gray-700">
                {user?.fullName || user?.firstName || "User"}
              </span> */}
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
