import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { AuditLoggingOperations, AuditQueryOperations } from "./auditLogger";

// Helper function to validate admin context
function validateAdminContext(request: NextRequest) {
  const userRole = request.headers.get("x-user-role");
  if (userRole !== "admin") {
    throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
  }

  const adminUserId = request.headers.get("x-user-id");
  if (!adminUserId) {
    throw new ApiError(
      401,
      "Admin user not authenticated",
      "ADMIN_UNAUTHORIZED",
    );
  }

  return adminUserId;
}

export async function GET(request: NextRequest) {
  try {
    const adminUserId = validateAdminContext(request);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const resourceType = searchParams.get("resourceType");
    const resourceId = searchParams.get("resourceId");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let auditLogs;

    if (userId) {
      auditLogs = await AuditQueryOperations.getAuditLogsForUser(
        userId,
        limit,
        offset,
      );
    } else if (resourceType && resourceId) {
      auditLogs = await AuditQueryOperations.getAuditLogsForResource(
        resourceType,
        resourceId,
        limit,
        offset,
      );
    } else if (action) {
      auditLogs = await AuditQueryOperations.getAuditLogsByAction(
        action,
        limit,
        offset,
      );
    } else if (startDate && endDate) {
      auditLogs = await AuditQueryOperations.getAuditLogsByDateRange(
        new Date(startDate),
        new Date(endDate),
        limit,
        offset,
      );
    } else {
      throw new ApiError(
        400,
        "Missing required parameters",
        "MISSING_REQUIRED_PARAMETERS",
      );
    }

    return NextResponse.json({
      success: true,
      data: auditLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUserId = validateAdminContext(request);

    const body = await request.json();
    const { action, resourceType, resourceId, details, ipAddress, userAgent } =
      body;

    if (!action || !resourceType) {
      throw new ApiError(
        400,
        "Missing required fields: action, resourceType",
        "MISSING_REQUIRED_FIELDS",
      );
    }

    await AuditLoggingOperations.logAuditEvent(
      adminUserId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    );

    return NextResponse.json({
      success: true,
      message: "Audit event logged successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateAdminContext(request);

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get("olderThanDays") || "90");

    const deletedCount =
      await AuditLoggingOperations.cleanOldAuditLogs(olderThanDays);

    return NextResponse.json({
      success: true,
      message: `Cleaned ${deletedCount} old audit logs`,
      deletedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
