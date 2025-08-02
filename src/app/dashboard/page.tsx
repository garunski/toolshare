"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hook/useAuth";

import { DashboardCard } from "./components/DashboardCard";

const dashboardCards = [
  {
    title: "My Tools",
    description: "Manage your tool inventory",
    content: "Add, edit, and manage the tools you want to share with your community.",
    buttonText: "View My Tools",
    href: "/tools",
  },
  {
    title: "Find Tools",
    description: "Discover tools from your community",
    content: "Browse and search for tools available in your neighborhood.",
    buttonText: "Browse Tools",
    href: "/tools/browse",
  },
  {
    title: "My Loans",
    description: "Track your borrowing activity",
    content: "View your current loans and borrowing history.",
    buttonText: "View Loans",
    href: "/loans",
  },
  {
    title: "Community",
    description: "Connect with neighbors",
    content: "Build your network and connect with trusted community members.",
    buttonText: "View Community",
    href: "/community",
  },
  {
    title: "Messages",
    description: "Communicate with other users",
    content: "Chat with tool owners and borrowers.",
    buttonText: "View Messages",
    href: "/messages",
  },
  {
    title: "Profile",
    description: "Manage your account",
    content: "Update your profile information and preferences.",
    buttonText: "Edit Profile",
    href: "/profile",
  },
];

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Not authenticated</h1>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ToolShare</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dashboardCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
