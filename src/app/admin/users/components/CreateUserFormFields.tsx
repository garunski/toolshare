"use client";

import { Input } from "@/primitives/input";
import { Textarea } from "@/primitives/textarea";
import type { Role } from "@/types/roles";

import { RoleSelection } from "./RoleSelection";

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  bio: string;
  selectedRoleIds: string[];
}

interface CreateUserFormFieldsProps {
  formData: UserFormData;
  roles: Role[];
  onInputChange: (field: keyof UserFormData, value: string) => void;
  onRoleToggle: (roleId: string) => void;
}

export function CreateUserFormFields({
  formData,
  roles,
  onInputChange,
  onRoleToggle,
}: CreateUserFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name *
          </label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => onInputChange("firstName", e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name *
          </label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => onInputChange("lastName", e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address *
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => onInputChange("address", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onInputChange("bio", e.target.value)}
          rows={3}
          className="mt-1"
        />
      </div>

      <RoleSelection
        roles={roles}
        selectedRoleIds={formData.selectedRoleIds}
        onRoleToggle={onRoleToggle}
      />
    </>
  );
}
