"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  BarChart2,
  Package,
  ShoppingCart,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "../components/loader";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <Loader className="w-16 h-16 text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <main className="flex-grow">
        <Header />
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-6 animate-fade-in-up">
              Revolutionize Your FMCG Distribution
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Elevate your inventory management, supercharge sales tracking, and
              boost efficiency with our cutting-edge system.
            </p>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-100 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-400"
                >
                  Explore Dashboard <ArrowRight className="ml-2" />
                </Button>
              </Link>
            ) : (
              <SignInButton>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-100 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-400"
                >
                  Get Started Now <ArrowRight className="ml-2" />
                </Button>
              </SignInButton>
            )}
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
              Our Premium Product Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  name: "Gourmet Cooking Oils",
                  image: "/placeholder.svg?height=120&width=120",
                  color: "from-yellow-400 to-orange-400",
                },
                {
                  name: "Premium Baby Care",
                  image: "/placeholder.svg?height=120&width=120",
                  color: "from-pink-400 to-red-400",
                },
                {
                  name: "Luxury Hair Care",
                  image: "/placeholder.svg?height=120&width=120",
                  color: "from-purple-400 to-indigo-400",
                },
                {
                  name: "Artisanal Chocolates",
                  image: "/placeholder.svg?height=120&width=120",
                  color: "from-brown-400 to-yellow-600",
                },
                {
                  name: "Advanced Diapers",
                  image: "/placeholder.svg?height=120&width=120",
                  color: "from-blue-400 to-green-400",
                },
                {
                  name: "Exclusive FMCG",
                  image: "/placeholder.svg?height=120&width=120",
                  color: "from-gray-400 to-blue-400",
                },
              ].map((category) => (
                <Card
                  key={category.name}
                  className={`text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
                >
                  <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                  <CardContent className="pt-8">
                    <div className="rounded-full bg-gray-100 p-4 inline-block mb-6">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={120}
                        height={120}
                        className="rounded-full"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {isSignedIn && (
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
                Quick Access Dashboard
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <QuickAccessCard
                  title="Analytics Dashboard"
                  icon={<BarChart2 className="h-8 w-8 text-blue-500" />}
                  href="/dashboard"
                  description="Comprehensive overview of your inventory and sales performance"
                  color="from-blue-500 to-purple-500"
                />
                <QuickAccessCard
                  title="Product Management"
                  icon={<Package className="h-8 w-8 text-green-500" />}
                  href="/dashboard/products"
                  description="Efficiently manage and update your diverse product catalog"
                  color="from-green-500 to-teal-500"
                />
                <QuickAccessCard
                  title="Sales Tracker"
                  icon={<ShoppingCart className="h-8 w-8 text-yellow-500" />}
                  href="/dashboard/sales-book"
                  description="Monitor and analyze your sales data in real-time"
                  color="from-yellow-500 to-orange-500"
                />
                <QuickAccessCard
                  title="Inventory Control"
                  icon={<Users className="h-8 w-8 text-red-500" />}
                  href="/dashboard/inventory"
                  description="Keep your stock levels optimized and up-to-date"
                  color="from-red-500 to-pink-500"
                />
              </div>
            </div>
          </section>
        )}

        <section className="py-20 bg-gradient-to-br from-indigo-100 to-purple-100">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
              Why Choose Our Advanced Inventory Management System?
            </h2>
            <div className="grid gap-10 md:grid-cols-3">
              <FeatureCard
                title="Real-time Precision Tracking"
                description="Experience unparalleled accuracy with our real-time inventory and sales monitoring for data-driven decision making."
                color="from-blue-400 to-indigo-600"
              />
              <FeatureCard
                title="Intelligent Distribution Optimization"
                description="Revolutionize your distribution process with our AI-powered logistics features for maximum efficiency."
                color="from-green-400 to-emerald-600"
              />
              <FeatureCard
                title="Advanced Business Analytics"
                description="Unlock the full potential of your data with our comprehensive reports and predictive analytics tools."
                color="from-orange-400 to-red-600"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function QuickAccessCard({ title, icon, href, description, color }) {
  return (
    <Card
      className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
    >
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <Link href={href}>
          <Button
            variant="outline"
            className={`w-full bg-gradient-to-r ${color} text-white border-0 hover:opacity-90`}
          >
            Access {title} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ title, description, color }) {
  return (
    <Card
      className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
    >
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
