"use client";

import { useState } from "react";

import { Text } from "@/primitives/text";
import type { Role } from "@/types/roles";

import { CreateUserFormActions } from "./CreateUserFormActions";
import { CreateUserFormFields } from "./CreateUserFormFields";

interface CreateUserFormProps {
  roles: Role[];
  onUserCreated: () => void;
  onCancel: () => void;
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  bio: string;
  selectedRoleIds: string[];
}

export function CreateUserForm({
  roles,
  onUserCreated,
  onCancel,
}: CreateUserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    bio: "",
    selectedRoleIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoleIds: prev.selectedRoleIds.includes(roleId)
        ? prev.selectedRoleIds.filter((id) => id !== roleId)
        : [...prev.selectedRoleIds, roleId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          bio: formData.bio || undefined,
          roleIds:
            formData.selectedRoleIds.length > 0
              ? formData.selectedRoleIds
              : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      setSuccess(
        `User created successfully! Generated password: ${result.data.generatedPassword}`,
      );

      // Reset form
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        bio: "",
        selectedRoleIds: [],
      });

      // Call callback after a short delay
      setTimeout(() => {
        onUserCreated();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <div className="mb-6">
        <Text className="text-lg font-semibold text-gray-900">
          Create New User
        </Text>
        <Text className="text-sm text-gray-600">
          Create a new user account with optional role assignments
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CreateUserFormFields
          formData={formData}
          roles={roles}
          onInputChange={handleInputChange}
          onRoleToggle={handleRoleToggle}
        />

        <CreateUserFormActions
          loading={loading}
          error={error}
          success={success}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
}
