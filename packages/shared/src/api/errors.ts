export class ApiClientError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiClientError';
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export const getFriendlyApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) {
    if (error.status === 404) return 'The requested resource was not found.';
    if (error.status === 401) return 'Your session expired. Please sign in again.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status === 422 || error.status === 400) return error.message;
    if (error.status && error.status >= 500) return 'The server is temporarily unavailable.';
    if (!error.status) return 'Unable to reach the backend service.';
    return error.message;
  }

  return 'A network error occurred. Please try again.';
};
