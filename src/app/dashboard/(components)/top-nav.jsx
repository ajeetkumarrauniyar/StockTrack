"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const path = pathname.split("/").pop() || "dashboard";
    setPageTitle(path.charAt(0).toUpperCase() + path.slice(1));
  }, [pathname]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <h1 className="text-2xl font-semibold">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        {/* <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button> */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.fullName || "User avatar"}
                  />
                  <AvatarFallback>
                    {user.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.fullName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  handleSignOut();
                }}
                disabled={isSigningOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/sign-in">
              <User className="w-5 h-5" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
