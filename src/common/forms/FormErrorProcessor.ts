export function processFormError(error: unknown) {
  let handled = false;
  const fieldErrors: Record<string, string> = {};
  let generalError: string | null = null;

  if (typeof error === "object" && error !== null) {
    const errObj = error as {
      error?: string;
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
      if (Object.keys(fieldErrors).length > 0) {
        handled = true;
      }
    }

    if (!handled && errObj.error) {
      generalError = errObj.error;
      handled = true;
    }
  }

  if (!handled) {
    if (error instanceof Error) {
      generalError = error.message;
    } else {
      generalError = "Operation failed";
    }
  }

  return { fieldErrors, generalError };
}
