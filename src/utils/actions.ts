import { flattenValidationErrors } from "next-safe-action";

/**
 * Extracts a user-friendly error message from next-safe-action error result.
 * Handles serverError, thrownError, and validationErrors.
 */
export function getActionErrorMessage(error: {
  serverError?: string;
  validationErrors?: Record<string, unknown>;
  thrownError?: Error;
}): string {
  if (error.serverError) {
    return error.serverError;
  }
  if (error.thrownError) {
    return error.thrownError.message;
  }
  if (error.validationErrors) {
    const { formErrors, fieldErrors } = flattenValidationErrors(
      error.validationErrors as Parameters<typeof flattenValidationErrors>[0],
    );

    const firstFormError = formErrors[0];

    if (firstFormError) {
      return firstFormError;
    }

    const firstFieldError = Object.values(fieldErrors).flat()[0];

    if (firstFieldError) {
      return firstFieldError as string;
    }
  }
  return "Something went wrong";
}
