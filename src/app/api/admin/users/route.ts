import { NextRequest } from "next/server";

import { validateUserCreationWithGeneratedPassword } from "@/admin/users/validation";
import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { RoleQueryOperations } from "../roles/list/getRoles";
import { RolePermissionOperations } from "../roles/permissions/managePermissions";
import { createApiResponse } from "../roles/responses/responseHandler";

import { performUserCreation } from "./create/performUser";

export async function GET(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    const hasPermission = await RolePermissionOperations.managePermissions(
      userId,
      "manage_users",
    );

    if (!hasPermission.hasPermission) {
      throw new ApiError(403, "Insufficient permissions");
    }

    const users = await RoleQueryOperations.getAllUsersWithRoles();

    return createApiResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    // Check admin permissions
    const hasPermission = await RolePermissionOperations.managePermissions(
      userId,
      "manage_users",
    );

    if (!hasPermission.hasPermission) {
      throw new ApiError(403, "Insufficient permissions");
    }

    const body = await request.json();

    // Validate the request data
    const validatedData = validateUserCreationWithGeneratedPassword(body);

    // Create the user with roles
    const newUser = await performUserCreation(validatedData);

    return createApiResponse({
      message: "User created successfully",
      data: {
        user: newUser,
        generatedPassword: validatedData.password,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
