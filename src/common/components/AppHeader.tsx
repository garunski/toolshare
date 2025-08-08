"use client";

import Link from "next/link";

import { usePermissions } from "@/admin/hooks";
import { useAuth } from "@/common/hooks/useAuth";
import { Button } from "@/primitives/button";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, subtitle, children }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { isAdmin } = usePermissions(user?.id);

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>

            {/* Navigation Links */}
            <nav className="hidden items-center space-x-6 md:flex">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link href="/tools" className="text-gray-600 hover:text-gray-900">
                My Tools
              </Link>
              <Link
                href="/tools/browse"
                className="text-gray-600 hover:text-gray-900"
              >
                Browse Tools
              </Link>
              <Link href="/loans" className="text-gray-600 hover:text-gray-900">
                Loans
              </Link>
              <Link
                href="/social"
                className="text-gray-600 hover:text-gray-900"
              >
                Social
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {children}
            {isAdmin && (
              <Link href="/admin">
                <Button outline>Admin</Button>
              </Link>
            )}
            <Button onClick={signOut} outline>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
