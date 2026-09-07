/**
 * Authorization — the single place roles and permissions are decided.
 *
 * Components never compare roles inline. They ask `can(...)` or one of the
 * `requireX` helpers, so the permission model can evolve without hunting
 * role strings across the UI. All enforcement happens server-side; these
 * helpers are used by API routes, server components, and server actions.
 */

import type { UserRole } from "@/lib/db/schema";

/** Role hierarchy — higher index = more authority. */
export const ROLE_ORDER: Record<UserRole, number> = {
  user: 0,
  creator: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

/** True when the user's role meets or exceeds the required role. */
export function hasRole(user: { role: UserRole }, required: UserRole): boolean {
  return ROLE_ORDER[user.role] >= ROLE_ORDER[required];
}

/** True when the user holds any of the listed roles. */
export function isOneOf(user: { role: UserRole }, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

/* ── Granular permissions ──────────────────────────────────────────────
   Centralized capability map. A role either has a permission directly or
   inherits it from a lower role via `hasRole`. */

export type Permission =
  | "users.read"
  | "users.manage"
  | "content.create"
  | "content.edit.own"
  | "content.publish.own"
  | "content.moderate"
  | "content.delete"
  | "reports.read"
  | "reports.manage"
  | "creators.manage"
  | "analytics.read"
  | "settings.manage";

/** The role that grants each permission (inclusive — higher roles inherit). */
const PERMISSION_MIN_ROLE: Record<Permission, UserRole> = {
  "users.read": "moderator",
  "users.manage": "admin",
  "content.create": "user",
  "content.edit.own": "user",
  "content.publish.own": "creator",
  "content.moderate": "moderator",
  "content.delete": "moderator",
  "reports.read": "moderator",
  "reports.manage": "moderator",
  "creators.manage": "moderator",
  "analytics.read": "moderator",
  "settings.manage": "admin",
};

/** Whether a user can perform a permission (role hierarchy inclusive). */
export function can(user: { role: UserRole }, permission: Permission): boolean {
  const minRole = PERMISSION_MIN_ROLE[permission];
  return ROLE_ORDER[user.role] >= ROLE_ORDER[minRole];
}

/** Convenience role guards — used by API routes after resolving the user. */
export const requireRole = {
  creator: (user: { role: UserRole }) => hasRole(user, "creator"),
  moderator: (user: { role: UserRole }) => hasRole(user, "moderator"),
  admin: (user: { role: UserRole }) => hasRole(user, "admin"),
  superAdmin: (user: { role: UserRole }) => user.role === "super_admin",
};