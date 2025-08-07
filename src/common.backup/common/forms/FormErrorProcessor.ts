export function processFormError(error: unknown) {
  let handled = false;
  const fieldErrors: Record<string, string> = {};
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
      if (Object.keys(fieldErrors).length > 0) {
        handled = true;
      }
    }

    if (!handled && errObj.error) {
      if (typeof errObj.error === "string") {
        generalError = errObj.error;
      } else if (errObj.error instanceof Error) {
        generalError = errObj.error.message;
      } else {
        generalError = "An error occurred";
      }
      handled = true;
    }

    if (!handled && errObj.message) {
      generalError = errObj.message;
      handled = true;
    }
  }

  if (!handled) {
    if (error instanceof Error) {
      generalError = error.message;
    } else if (typeof error === "string") {
      generalError = error;
    } else {
      generalError = "Operation failed";
    }
  }

  return { fieldErrors, generalError };
}
