import { NextRequest } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { handleAttributeDelete } from "./handlers/handleAttributeDelete";
import { handleAttributeGet } from "./handlers/handleAttributeGet";
import { handleAttributePost } from "./handlers/handleAttributePost";
import { handleAttributePut } from "./handlers/handleAttributePut";

export async function GET(request: NextRequest) {
  try {
    // Get admin context from middleware headers
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const dataType = searchParams.get("dataType");
    const attributeId = searchParams.get("attributeId");

    return await handleAttributeGet(categoryId, dataType, attributeId);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get admin context from middleware headers
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const body = await request.json();
    return await handleAttributePost(body);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get admin context from middleware headers
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const body = await request.json();
    return await handleAttributePut(body);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get admin context from middleware headers
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const attributeId = searchParams.get("attributeId");

    return await handleAttributeDelete(categoryId, attributeId);
  } catch (error) {
    return handleApiError(error);
  }
}
