/** Shape that Axios errors expose on the response body. */
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
      bookCount?: number;
    };
    status?: number;
  };
}

/**
 * Extract a human-readable error message from an axios-style API error.
 *
 * Resolution order:
 *  1. `response.data.error`
 *  2. `response.data.message`
 *  3. `fallback` argument
 */
export function parseApiError(
  err: unknown,
  fallback = 'An unexpected error occurred. Please try again.',
): string {
  const apiErr = err as ApiErrorResponse;
  return (
    apiErr?.response?.data?.error ||
    apiErr?.response?.data?.message ||
    (err instanceof Error ? err.message : null) ||
    fallback
  );
}

/**
 * Extract the HTTP status code from an axios-style API error.
 * Returns undefined when the error has no response.
 */
export function getApiStatus(err: unknown): number | undefined {
  return (err as ApiErrorResponse)?.response?.status;
}
