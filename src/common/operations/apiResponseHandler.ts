import { NextResponse } from "next/server";

import { processFormError } from "@/common/forms/FormErrorProcessor";

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  details?: {
    errors: Array<{
      field: string;
      message: string;
    }>;
  };
}

export const createApiResponse = <T>(
  data: T,
  status: number = 200,
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({ success: true, data }, { status });
};

export const createErrorResponse = (
  error: string,
  status: number = 500,
): NextResponse<ApiResponse> => {
  return NextResponse.json({ error }, { status });
};

export const createValidationErrorResponse = (
  fieldErrors: Record<string, string>,
): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      details: {
        errors: Object.entries(fieldErrors).map(([field, message]) => ({
          field,
          message,
        })),
      },
    },
    { status: 400 },
  );
};

export const createMissingFieldsResponse = (
  requiredFields: string[],
): NextResponse<ApiResponse> => {
  return NextResponse.json(
    { error: `Missing required fields: ${requiredFields.join(", ")}` },
    { status: 400 },
  );
};

export const handleApiError = (error: any): NextResponse<ApiResponse> => {
  const { fieldErrors, generalError } = processFormError(error);

  if (Object.keys(fieldErrors).length > 0) {
    return createValidationErrorResponse(fieldErrors);
  }

  return createErrorResponse(generalError || "An error occurred", 500);
};

export const validateRequiredFields = (
  body: any,
  requiredFields: string[],
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter((field) => !body[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

export const createSuccessResponse = (): NextResponse<ApiResponse> => {
  return NextResponse.json({ success: true });
};
