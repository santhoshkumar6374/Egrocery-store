/**
 * The backend's ApiResponse/ErrorResponse envelope always carries a human-readable
 * "message" field (see GlobalExceptionHandler in the Spring Boot app) — this pulls
 * it out with a sensible fallback for network failures etc.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || fallback;
}