import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import {
  getItemsByOwner,
  getItemsByOwnerWithFilters,
  updateItemOwner,
} from "./performOwnerUpdate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const { id } = await params;

    // Validate dynamic parameter
    if (!id) {
      throw new ApiError(400, "Invalid ID parameter", "INVALID_ID");
    }

    const { searchParams } = new URL(request.url);

    // Check if filters are provided
    const categoryId = searchParams.get("categoryId");
    const condition = searchParams.get("condition")?.split(",");
    const isAvailable = searchParams.get("isAvailable");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (categoryId || condition || isAvailable !== null) {
      // Use filtered version
      const filters = {
        categoryId: categoryId || undefined,
        condition: condition || undefined,
        isAvailable: isAvailable !== null ? isAvailable === "true" : undefined,
        limit,
        offset,
      };

      const result = await getItemsByOwnerWithFilters(id, filters);

      if (!result.success) {
        throw new ApiError(
          400,
          result.error || "Failed to get filtered items",
          "FILTERED_ITEMS_FAILED",
        );
      }

      return NextResponse.json(result.data);
    } else {
      // Use simple version
      const result = await getItemsByOwner(id);

      if (!result.success) {
        throw new ApiError(
          400,
          result.error || "Failed to get items",
          "ITEMS_FETCH_FAILED",
        );
      }

      return NextResponse.json(result.data);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const { id } = await params;

    // Validate dynamic parameter
    if (!id) {
      throw new ApiError(400, "Invalid ID parameter", "INVALID_ID");
    }

    const body = await request.json();
    const { newOwnerId } = body;

    if (!newOwnerId) {
      throw new ApiError(400, "newOwnerId is required", "MISSING_NEW_OWNER_ID");
    }

    const result = await updateItemOwner(id, newOwnerId);

    if (!result.success) {
      throw new ApiError(
        400,
        result.error || "Failed to update item owner",
        "OWNER_UPDATE_FAILED",
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}
