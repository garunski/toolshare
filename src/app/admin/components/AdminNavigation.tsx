"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuthWithRoles } from "@/common/hooks/useAuthWithRoles";
import { Button } from "@/primitives/button";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/primitives/navbar";

const navigationItems = [
  { name: "Dashboard", href: "/admin", permission: "view_analytics" },
  { name: "Users", href: "/admin/users", permission: "manage_users" },
  { name: "Roles", href: "/admin/roles", permission: "manage_roles" },
  {
    name: "Categories",
    href: "/admin/categories",
    permission: "manage_categories",
  },
  {
    name: "External Taxonomy",
    href: "/admin/categories/external",
    permission: "manage_categories",
  },
  {
    name: "Attributes",
    href: "/admin/attributes",
    permission: "manage_attributes",
  },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const { user, signOut, checkPermissionSync } = useAuthWithRoles();

  const visibleItems = navigationItems.filter((item) =>
    checkPermissionSync(item.permission),
  );

  return (
    <Navbar className="border-b border-gray-200 bg-white">
      <NavbarSection>
        <Link href="/admin" className="text-xl font-bold text-gray-900">
          ToolShare Admin
        </Link>
      </NavbarSection>

      <NavbarSection>
        {visibleItems.map((item) => (
          <NavbarItem
            key={item.name}
            href={item.href}
            current={pathname === item.href}
          >
            {item.name}
          </NavbarItem>
        ))}
      </NavbarSection>

      <NavbarSpacer />

      <NavbarSection>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </span>
          <Button outline onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </NavbarSection>
    </Navbar>
  );
}
