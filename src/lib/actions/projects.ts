"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireProjectRole } from "@/lib/rbac";
import { projectSchema, memberSchema, memberRoleSchema } from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

/** Create a project; the creator becomes its OWNER. */
export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = projectSchema.safeParse({
    key: formData.get("key"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid project" };
  }

  const { key, name, description } = parsed.data;
  let projectId: string;
  try {
    const project = await prisma.project.create({
      data: {
        key,
        name,
        description: description || null,
        memberships: { create: { userId, role: "OWNER" } },
      },
    });
    projectId = project.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `Project key "${key}" is already taken` };
    }
    throw e;
  }

  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

/** Add a member by email. Requires MANAGER+ on the project. */
export async function addMember(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireProjectRole(projectId, "MANAGER");
  const parsed = memberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid member" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { error: "No registered user with that email" };

  try {
    await prisma.membership.create({
      data: { projectId, userId: user.id, role: parsed.data.role },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "That user is already a member" };
    }
    throw e;
  }

  revalidatePath(`/projects/${projectId}/settings`);
  return undefined;
}

/** Change a member's role. Requires OWNER. */
export async function changeMemberRole(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireProjectRole(projectId, "OWNER");
  const parsed = memberRoleSchema.safeParse({
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Invalid role change" };

  const membership = await prisma.membership.findUnique({
    where: { id: parsed.data.membershipId },
    select: { projectId: true, role: true },
  });
  if (!membership || membership.projectId !== projectId) {
    return { error: "Member not found" };
  }

  // Don't allow demoting the last OWNER; a project must always have an owner.
  if (membership.role === "OWNER" && parsed.data.role !== "OWNER") {
    const owners = await prisma.membership.count({
      where: { projectId, role: "OWNER" },
    });
    if (owners <= 1) return { error: "A project must have at least one owner" };
  }

  await prisma.membership.update({
    where: { id: parsed.data.membershipId },
    data: { role: parsed.data.role },
  });

  revalidatePath(`/projects/${projectId}/settings`);
  return undefined;
}

/** Remove a member. Requires OWNER. Cannot remove the last owner. */
export async function removeMember(projectId: string, membershipId: string): Promise<void> {
  await requireProjectRole(projectId, "OWNER");
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    select: { projectId: true, role: true },
  });
  if (!membership || membership.projectId !== projectId) return;

  if (membership.role === "OWNER") {
    const owners = await prisma.membership.count({ where: { projectId, role: "OWNER" } });
    if (owners <= 1) return;
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath(`/projects/${projectId}/settings`);
}
