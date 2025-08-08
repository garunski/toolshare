import { NextResponse } from "next/server";

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
  let fieldErrors: Record<string, string> = {};
  let generalError: string | null = null;

  if (typeof error === "object" && error !== null) {
    const errObj = error as {
      error?: string | Error;
      message?: string;
      details?: {
        errors?: Array<{ field?: string; message?: string }>;
      };
    };

    if (errObj.details && Array.isArray(errObj.details.errors)) {
      errObj.details.errors.forEach((err) => {
        if (err.field) {
          fieldErrors[err.field] = err.message || "Invalid value";
        }
      });
    }

    if (Object.keys(fieldErrors).length === 0) {
      if (errObj.error) {
        if (typeof errObj.error === "string") {
          generalError = errObj.error;
        } else if (errObj.error instanceof Error) {
          generalError = errObj.error.message;
        } else {
          generalError = "An error occurred";
        }
      } else if (errObj.message) {
        generalError = errObj.message;
      }
    }
  }

  if (!generalError && Object.keys(fieldErrors).length === 0) {
    if (error instanceof Error) {
      generalError = error.message;
    } else if (typeof error === "string") {
      generalError = error;
    } else {
      generalError = "Operation failed";
    }
  }

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
