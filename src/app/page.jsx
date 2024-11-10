"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart2,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isLoaded) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Welcome to Your Inventory Management System
      </h1>

      {isSignedIn ? (
        <>
          <p className="mb-4 font-bold text-2xl">Hello, {user.firstName}!</p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quick Access
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Link href="/dashboard">
                  <Button className="w-full">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Manage Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/products">
                  <Button variant="outline" className="w-full">
                    View Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/sales">
                  <Button variant="outline" className="w-full">
                    Manage Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/inventory">
                  <Button variant="outline" className="w-full">
                    Check Inventory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
            <p className="mb-4">
              This Inventory Management System helps you keep track of your
              products, sales, and inventory levels. Use the quick access
              buttons above to navigate to different sections of the system.
            </p>
            <p>
              For detailed analytics and real-time data, visit the
              <Link
                href="/dashboard"
                className="text-primary hover:underline ml-1"
              >
                Dashboard
              </Link>
              .
            </p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4">
            Please sign in to access the Inventory Management System.
          </p>
          <SignInButton>
            <Button className="mr-2">Sign In</Button>
          </SignInButton>
          <Link href="/sign-up">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
