"use client";

import { useState } from "react";

import { Button } from "@/primitives/button";
import type { Role } from "@/types/roles";

import { CreateUserForm } from "../CreateUserForm";

interface UserManagementActionsProps {
  roles: Role[];
}

export function UserManagementActions({ roles }: UserManagementActionsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleUserCreated = () => {
    setShowCreateForm(false);
    // Refresh the page to show the new user
    window.location.reload();
  };

  const handleCancel = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          Create User
        </Button>
      </div>

      {showCreateForm && (
        <CreateUserForm
          roles={roles}
          onUserCreated={handleUserCreated}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
