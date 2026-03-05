// ─── Access Level Permissions ─────────────────────────────────────────────────
// Controls which roles can access restricted/confidential content.
// Managed at the space level via SpacePermissions → Permissions tab.
// Individual files/documents still support per-resource temporary access requests.

export type AccessLevel = 'public' | 'restricted' | 'confidential';

// Default matrix: role → which access levels they can view
// (public is always allowed for all roles)
const defaultAccessMatrix: Record<string, { restricted: boolean; confidential: boolean }> = {
  owner:               { restricted: true,  confidential: true  },
  admin:               { restricted: true,  confidential: true  },
  member:              { restricted: true,  confidential: false },
  guest:               { restricted: false, confidential: false },
  'custom-contributor': { restricted: true,  confidential: false },
  'custom-reviewer':   { restricted: false, confidential: false },
};

let accessMatrix = { ...defaultAccessMatrix };

/** Check if a role can access a given access level */
export function canRoleAccess(role: string, level: AccessLevel): boolean {
  if (level === 'public') return true;
  const entry = accessMatrix[role];
  if (!entry) return false;
  return entry[level] ?? false;
}

/** Update the matrix (called from SpacePermissions when toggling) */
export function updateAccessPermission(role: string, level: 'restricted' | 'confidential', allowed: boolean) {
  if (!accessMatrix[role]) {
    accessMatrix[role] = { restricted: false, confidential: false };
  }
  accessMatrix[role] = { ...accessMatrix[role], [level]: allowed };
}

/** Get the full matrix (for UI display) */
export function getAccessMatrix() {
  return { ...accessMatrix };
}

/** Reset to defaults */
export function resetAccessMatrix() {
  accessMatrix = { ...defaultAccessMatrix };
}
