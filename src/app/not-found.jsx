"use client";
import Link from "next/link";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";

export default function NotFound() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Oops! The page you&lsquo;re looking for doesn&lsquo;t exist.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <Home className="mr-2 h-4 w-4" /> Go to Homepage
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Stock Track Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
