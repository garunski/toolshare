import { NextResponse } from "next/server";

// Legacy function exports for backward compatibility
export const createApiResponse = <T>(
  data: T,
  message: string = "Success",
  status: number = 200,
): NextResponse => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
};

export const createMissingFieldsResponse = (
  requiredFields: string[],
): NextResponse => {
  return NextResponse.json(
    { error: `Missing required fields: ${requiredFields.join(", ")}` },
    { status: 400 },
  );
};

export const createSuccessResponse = (): NextResponse => {
  return NextResponse.json({ success: true });
};

export const handleApiError = (error: any): NextResponse => {
  const errorMessage = error?.message || "Internal server error";
  console.error("API Error:", errorMessage);
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status: 500 },
  );
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
