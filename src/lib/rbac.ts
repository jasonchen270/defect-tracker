import type { ProjectRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Role ranking, highest privilege first. A user "has at least" a role if their
// rank is >= the required role's rank.
const RANK: Record<ProjectRole, number> = {
  OWNER: 4,
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export function atLeast(role: ProjectRole, required: ProjectRole): boolean {
  return RANK[role] >= RANK[required];
}

export class AuthError extends Error {}
export class ForbiddenError extends Error {}

/** The current user id, or throw if not signed in. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("Not authenticated");
  return session.user.id;
}

/**
 * Resolve the current user's membership on a project. Returns the role, or null
 * if they aren't a member. Throws AuthError if not signed in.
 */
export async function projectRole(projectId: string): Promise<ProjectRole | null> {
  const userId = await requireUserId();
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { role: true },
  });
  return membership?.role ?? null;
}

/**
 * Require that the current user has at least `required` on the project.
 * Returns { userId, role }. Throws ForbiddenError otherwise.
 */
export async function requireProjectRole(
  projectId: string,
  required: ProjectRole,
): Promise<{ userId: string; role: ProjectRole }> {
  const userId = await requireUserId();
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { role: true },
  });
  if (!membership || !atLeast(membership.role, required)) {
    throw new ForbiddenError("Insufficient permissions for this project");
  }
  return { userId, role: membership.role };
}
