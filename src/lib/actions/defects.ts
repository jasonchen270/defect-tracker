"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireProjectRole, projectRole } from "@/lib/rbac";
import {
  createDefectSchema,
  updateDefectSchema,
  commentSchema,
} from "@/lib/validation";
import type { ActionState } from "@/lib/actions/projects";

// Fields we audit on update, with friendly labels for the activity log.
const AUDITED = ["status", "severity", "priority", "assigneeId"] as const;

/** Create a defect. Requires MEMBER+ (VIEWERs can't file). */
export async function createDefect(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { userId } = await requireProjectRole(projectId, "MEMBER");

  const parsed = createDefectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    severity: formData.get("severity"),
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid defect" };
  }

  const { title, description, severity, priority, assigneeId } = parsed.data;

  // Validate the assignee is actually a project member.
  if (assigneeId) {
    const member = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: assigneeId, projectId } },
      select: { id: true },
    });
    if (!member) return { error: "Assignee must be a project member" };
  }

  // Allocate the next per-project number and create the defect atomically, so two
  // concurrent creates can't collide on @@unique([projectId, number]).
  let defectId: string;
  for (let attempt = 0; ; attempt++) {
    const last = await prisma.defect.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const number = (last?.number ?? 0) + 1;
    try {
      const defect = await prisma.defect.create({
        data: {
          projectId,
          number,
          title,
          description: description || null,
          severity,
          priority,
          reporterId: userId,
          assigneeId: assigneeId || null,
        },
      });
      defectId = defect.id;
      break;
    } catch (e) {
      // Lost the race for this number; retry with a freshly-read max.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        attempt < 5
      ) {
        continue;
      }
      throw e;
    }
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/defects/${defectId}`);
}

/** Update defect fields, writing one ActivityLog row per changed field. */
export async function updateDefect(
  projectId: string,
  defectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { userId } = await requireProjectRole(projectId, "MEMBER");

  const parsed = updateDefectSchema.safeParse({
    status: formData.get("status") ?? undefined,
    severity: formData.get("severity") ?? undefined,
    priority: formData.get("priority") ?? undefined,
    assigneeId: formData.get("assigneeId") ?? undefined,
  });
  if (!parsed.success) return { error: "Invalid update" };

  const defect = await prisma.defect.findUnique({ where: { id: defectId } });
  if (!defect || defect.projectId !== projectId) return { error: "Defect not found" };

  const data: Prisma.DefectUpdateInput = {};
  const changes: { field: string; from: string | null; to: string | null }[] = [];

  if (parsed.data.status && parsed.data.status !== defect.status) {
    data.status = parsed.data.status;
    changes.push({ field: "status", from: defect.status, to: parsed.data.status });
    // Track lifecycle timestamps.
    if (parsed.data.status === "RESOLVED") data.resolvedAt = new Date();
    if (parsed.data.status === "CLOSED") data.closedAt = new Date();
    if (parsed.data.status === "REOPENED" || parsed.data.status === "OPEN") {
      data.resolvedAt = null;
      data.closedAt = null;
    }
  }
  if (parsed.data.severity && parsed.data.severity !== defect.severity) {
    data.severity = parsed.data.severity;
    changes.push({ field: "severity", from: defect.severity, to: parsed.data.severity });
  }
  if (parsed.data.priority && parsed.data.priority !== defect.priority) {
    data.priority = parsed.data.priority;
    changes.push({ field: "priority", from: defect.priority, to: parsed.data.priority });
  }
  if (parsed.data.assigneeId !== undefined) {
    const next = parsed.data.assigneeId === "__unassign__" ? null : parsed.data.assigneeId || null;
    if (next !== defect.assigneeId) {
      if (next) {
        const member = await prisma.membership.findUnique({
          where: { userId_projectId: { userId: next, projectId } },
          select: { id: true },
        });
        if (!member) return { error: "Assignee must be a project member" };
      }
      data.assignee = next ? { connect: { id: next } } : { disconnect: true };
      changes.push({ field: "assignee", from: defect.assigneeId, to: next });
    }
  }

  void AUDITED; // referenced for documentation of the audited set

  if (changes.length === 0) return undefined;

  await prisma.$transaction([
    prisma.defect.update({ where: { id: defectId }, data }),
    prisma.activityLog.createMany({
      data: changes.map((c) => ({
        defectId,
        actorId: userId,
        field: c.field,
        fromValue: c.from,
        toValue: c.to,
      })),
    }),
  ]);

  revalidatePath(`/projects/${projectId}/defects/${defectId}`);
  revalidatePath(`/projects/${projectId}`);
  return undefined;
}

/** Add a comment to a defect. Requires MEMBER+. */
export async function addComment(
  projectId: string,
  defectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { userId } = await requireProjectRole(projectId, "MEMBER");

  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }

  const defect = await prisma.defect.findUnique({
    where: { id: defectId },
    select: { projectId: true },
  });
  if (!defect || defect.projectId !== projectId) return { error: "Defect not found" };

  await prisma.comment.create({
    data: { defectId, authorId: userId, body: parsed.data.body },
  });

  revalidatePath(`/projects/${projectId}/defects/${defectId}`);
  return undefined;
}

/** Read access guard for any project page. Returns the role or redirects home. */
export async function ensureProjectAccess(projectId: string) {
  const role = await projectRole(projectId);
  if (!role) redirect("/projects");
  return role;
}
