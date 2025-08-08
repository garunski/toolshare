"use client";

import type { Role, UserWithRoles } from "@/types/roles";

import { UserCard } from "../UserCard";

interface UserCardWrapperProps {
  user: UserWithRoles;
  availableRoles: Role[];
}

export function UserCardWrapper({
  user,
  availableRoles,
}: UserCardWrapperProps) {
  const handleRoleUpdated = () => {
    // Refresh the page to show updated roles
    window.location.reload();
  };

  return (
    <UserCard
      user={user}
      availableRoles={availableRoles}
      onRoleUpdated={handleRoleUpdated}
    />
  );
}
