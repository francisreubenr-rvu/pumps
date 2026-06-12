export const Session = {
  cookieName: "kinetic_session",
  localCookieName: "kinetic_local_session",
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const Paths = {
  oauthCallback: "/api/oauth/callback",
} as const;

export const ErrorMessages = {
  unauthenticated: "You must be logged in to access this resource",
  insufficientRole: "You do not have permission to access this resource",
  notFound: "Resource not found",
  conflict: "Resource already exists",
  invalidInput: "Invalid input provided",
} as const;
