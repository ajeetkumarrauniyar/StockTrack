import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const Header = () => {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-3xl font-bold tracking-tight hover:text-blue-200 transition-colors"
        >
          <h1>Stock Track Pro</h1>
        </Link>
        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <span className="font-medium">Welcome, {user.firstName}!</span>
            <SignOutButton>
              <Button
                variant="outline"
                className="text-black hover:bg-white hover:text-purple-600 transition-colors"
              >
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        ) : (
          <div>
            <SignInButton>
              <Button
                variant="outline"
                className="mr-2 bg-white text-blue-400  hover:text-blue-600 transition-colors"
              >
                Sign In
              </Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button className="bg-white text-blue-400 hover:text-blue-600 transition-colors">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
