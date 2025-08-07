"use client";

import Link from "next/link";

import { AppHeader } from "@/common/components/AppHeader";
import { useAuth } from "@/common/hooks/useAuth";
import { usePermissions } from "@/common/hooks/usePermissions";
import { Button } from "@/primitives/button";

import { DashboardCard } from "./components/DashboardCard";

const dashboardCards = [
  {
    title: "My Tools",
    description: "Manage your tool inventory",
    content:
      "Add, edit, and manage the tools you want to share with your community.",
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
    title: "Social Network",
    description: "Connect with friends",
    content:
      "Build your network, manage friend requests, and discover new connections.",
    buttonText: "View Social",
    href: "/social",
  },
  {
    title: "Messages",
    description: "Communicate with other users",
    content: "Chat with tool owners and borrowers.",
    buttonText: "View Messages",
    href: "/social",
  },
  {
    title: "Profile",
    description: "Manage your account",
    content: "Update your profile information and preferences.",
    buttonText: "Edit Profile",
    href: "/profile",
  },
];

const adminCard = {
  title: "Admin Panel",
  description: "System administration and management",
  content: "Access administrative tools, user management, and system settings.",
  buttonText: "Go to Admin",
  href: "/admin",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { isAdmin } = usePermissions(user?.id);

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

  // Add admin card for non-admin users
  const allCards = isAdmin ? dashboardCards : [...dashboardCards, adminCard];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="ToolShare" subtitle={`Welcome back, ${user.email}`} />

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
