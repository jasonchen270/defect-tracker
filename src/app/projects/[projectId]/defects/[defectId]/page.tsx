import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectRole, atLeast } from "@/lib/rbac";
import { Badge } from "@/components/Badge";
import {
  STATUS_LABEL,
  STATUS_BADGE,
  SEVERITY_BADGE,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  fmtDate,
  relativeActivity,
} from "@/lib/ui";
import { DefectControls } from "./DefectControls";
import { CommentForm } from "./CommentForm";

export default async function DefectDetail({
  params,
}: {
  params: Promise<{ projectId: string; defectId: string }>;
}) {
  const { projectId, defectId } = await params;
  const role = await projectRole(projectId);
  if (!role) redirect("/projects");
  const canEdit = atLeast(role, "MEMBER");

  const defect = await prisma.defect.findUnique({
    where: { id: defectId },
    include: {
      project: { select: { key: true } },
      reporter: { select: { name: true, email: true } },
      assignee: { select: { name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, email: true } } },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, email: true } } },
      },
    },
  });
  if (!defect || defect.projectId !== projectId) notFound();

  const members = await prisma.membership.findMany({
    where: { projectId },
    orderBy: { user: { name: "asc" } },
    select: { user: { select: { id: true, name: true, email: true } } },
  });

  const reporterName = defect.reporter.name ?? defect.reporter.email;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-sm text-zinc-400">
            {defect.project.key}-{defect.number}
          </span>
          <Badge className={STATUS_BADGE[defect.status]}>{STATUS_LABEL[defect.status]}</Badge>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900">{defect.title}</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Reported by {reporterName} · {fmtDate(defect.createdAt)}
        </p>

        {defect.description ? (
          <div className="mt-4 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
            {defect.description}
          </div>
        ) : (
          <p className="mt-4 text-sm italic text-zinc-400">No description.</p>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">
            Comments <span className="font-normal text-zinc-400">({defect.comments.length})</span>
          </h2>
          <ul className="space-y-3">
            {defect.comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium text-zinc-600">
                    {c.author.name ?? c.author.email}
                  </span>
                  <span>{fmtDate(c.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-700">{c.body}</p>
              </li>
            ))}
            {defect.comments.length === 0 && (
              <li className="text-sm text-zinc-400">No comments yet.</li>
            )}
          </ul>
          {canEdit ? (
            <div className="mt-4">
              <CommentForm projectId={projectId} defectId={defectId} />
            </div>
          ) : (
            <p className="mt-4 text-xs text-zinc-400">Viewers can&apos;t comment.</p>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          {canEdit ? (
            <DefectControls
              projectId={projectId}
              defectId={defectId}
              status={defect.status}
              severity={defect.severity}
              priority={defect.priority}
              assigneeId={defect.assigneeId}
              members={members.map((m) => m.user)}
            />
          ) : (
            <dl className="space-y-3 text-sm">
              <Field label="Status">
                <Badge className={STATUS_BADGE[defect.status]}>{STATUS_LABEL[defect.status]}</Badge>
              </Field>
              <Field label="Severity">
                <Badge className={SEVERITY_BADGE[defect.severity]}>{defect.severity}</Badge>
              </Field>
              <Field label="Priority">
                <Badge className={PRIORITY_BADGE[defect.priority]}>
                  {PRIORITY_LABEL[defect.priority]}
                </Badge>
              </Field>
              <Field label="Assignee">
                <span className="text-zinc-700">
                  {defect.assignee ? (defect.assignee.name ?? defect.assignee.email) : "Unassigned"}
                </span>
              </Field>
            </dl>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">Activity</h2>
          <ul className="space-y-2 text-xs">
            {defect.activities.map((a) => (
              <li key={a.id} className="text-zinc-500">
                <span className="font-medium text-zinc-700">{a.actor.name ?? a.actor.email}</span>{" "}
                {relativeActivity(a.field, a.fromValue, a.toValue)}
                <span className="block text-zinc-400">{fmtDate(a.createdAt)}</span>
              </li>
            ))}
            {defect.activities.length === 0 && <li className="text-zinc-400">No changes yet.</li>}
          </ul>
        </div>

        <Link
          href={`/projects/${projectId}`}
          className="block text-center text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Back to board
        </Link>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-zinc-400">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
