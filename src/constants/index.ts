export const COGNITO_GROUPS = {
  ADMIN: "Admin",
} as const;

export const USER_ROLES = {
  ADMIN: "Admin",
} as const;

export function resolveRole(groups: string[]): string {
  return groups.includes(COGNITO_GROUPS.ADMIN) ? USER_ROLES.ADMIN : "";
}

export const DEFAULT_ADMIN_ROUTE = "/admin/eventi";

export const LOCAL_STORAGE_KEYS = {
  JWT_TOKEN: "jwtToken",
  ID_TOKEN: "idToken",
  ACCESS_TOKEN: "accessToken",
  USER_ROLE: "userRole",
  USER_EMAIL: "userEmail",
  RETURN_URL: "returnUrl",
} as const;
