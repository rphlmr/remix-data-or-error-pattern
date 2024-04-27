import { ResponseStub } from "@remix-run/server-runtime/dist/routeModules";

/**
 * Additional data to help us debug.
 */
export type AdditionalData = Record<string, unknown>;

/**
 * @param message The message intended for the user.
 *
 * Other params are for logging purposes and help us debug.
 * @param label The label of the error to help us debug and filter logs.
 * @param cause The error that caused the rejection.
 * @param additionalData Additional data to help us debug.
 *
 */
type FailureReason = {
  label: "Unknown 🐞" | "Auth error 🔐"; // ... anything you want to help you debug / filter in Sentry
  cause: unknown | null;
  message: string;
  additionalData?: AdditionalData;
  traceId?: string;
  status?:
    | 200 // ok
    | 204 // no content
    | 400 // bad request
    | 401 // unauthorized
    | 403 // forbidden
    | 404 // not found
    | 405 // method not allowed
    | 409 // conflict
    | 500; // internal server error;
};

/**
 * A custom error class to normalize the error handling in our app.
 */
export class AppError extends Error {
  readonly label: FailureReason["label"];
  readonly cause: FailureReason["cause"];
  readonly additionalData: FailureReason["additionalData"];
  readonly status: FailureReason["status"];
  traceId: FailureReason["traceId"];

  constructor({
    message,
    status,
    cause = null,
    additionalData,
    label,
    traceId,
  }: FailureReason) {
    super();
    this.label = label;
    this.message = message;
    this.status = isLikeAppError(cause)
      ? cause.status || status || 500
      : status || 500;
    this.cause = cause;
    this.additionalData = additionalData;
    this.traceId = traceId || crypto.randomUUID();
  }
}

export function makeAppError(cause: unknown, additionalData?: AdditionalData) {
  if (isLikeAppError(cause)) {
    // copy the original error and fill in the maybe missing fields like status or traceId
    return new AppError({
      ...cause,
      additionalData: {
        ...cause.additionalData,
        ...additionalData,
      },
    });
  }

  // 🤷‍♂️ We don't know what this error is, so we create a new default one.
  return new AppError({
    cause,
    message: "Sorry, an unexpected error occurred.",
    additionalData,
    label: "Unknown 🐞",
  });
}

/**
 * This helper function is used to check if an error is an instance of `AppError` or an object that looks like an `AppError`.
 */
export function isLikeAppError(cause: unknown): cause is AppError {
  return (
    cause instanceof AppError ||
    (typeof cause === "object" &&
      cause !== null &&
      "name" in cause &&
      cause.name !== "Error" &&
      "message" in cause)
  );
}

export function error(cause: AppError, response?: ResponseStub) {
  console.error(cause);

  if (response) {
    response.status = cause.status;
  }

  return {
    data: null,
    error: {
      message: cause.message,
      label: cause.label,
      ...(cause.additionalData && {
        additionalData: cause.additionalData,
      }),
      ...(cause.traceId && { traceId: cause.traceId }),
    },
  };
}

export type ErrorResponse = ReturnType<typeof error>;

export type ResponsePayload = Record<string, unknown> | null;

export function data<T>(data: T) {
  return { data, error: null };
}

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    response.error !== null
  );
}
