import type { Application, Role, SessionUser } from "./types";

export function canViewInstitution(user: SessionUser, institutionId: string): boolean {
  if (user.role === "Super Admin" || user.role === "AICTE Officer") return true;
  return user.role === "Institution Admin" && user.institutionId === institutionId;
}

export function canViewApplication(user: SessionUser, application: Application): boolean {
  if (canViewInstitution(user, application.institutionId)) return true;
  return user.role === "Auditor" && application.assignedAuditorId === user.id;
}

export function canManageApplication(user: SessionUser, application: Application): boolean {
  if (user.role === "Super Admin" || user.role === "AICTE Officer") return true;
  return user.role === "Institution Admin" && application.ownerId === user.id;
}

export function canRaiseObservation(user: SessionUser, application: Application): boolean {
  return canManageApplication(user, application) || (user.role === "Auditor" && application.assignedAuditorId === user.id);
}

export function requireRole(user: SessionUser | undefined, roles: Role[]): asserts user is SessionUser {
  if (!user) throw Object.assign(new Error("Authentication required"), { status: 401 });
  if (!roles.includes(user.role)) throw Object.assign(new Error("Insufficient role permissions"), { status: 403 });
}
