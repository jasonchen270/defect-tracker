import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { projectRole, atLeast } from "@/lib/rbac";
import { Badge } from "@/components/Badge";
import {
  BOARD_COLUMNS,
  STATUS_LABEL,
  STATUS_BADGE,
  SEVERITY_BADGE,
  PRIORITY_BADGE,
} from "@/lib/ui";

export default async function ProjectBoard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const role = await projectRole(projectId);
  const canCreate = role !== null && atLeast(role, "MEMBER");

  const [project, defects] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId }, select: { key: true } }),
    prisma.defect.findMany({
      where: { projectId },
      orderBy: [{ priority: "asc" }, { number: "desc" }],
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        severity: true,
        priority: true,
        assignee: { select: { name: true, email: true } },
      },
    }),
  ]);

  const byStatus = new Map<string, typeof defects>();
  for (const col of BOARD_COLUMNS) byStatus.set(col, []);
  let reopened = 0;
  for (const d of defects) {
    // Show REOPENED defects in the OPEN column so nothing gets lost.
    const col = d.status === "REOPENED" ? "OPEN" : d.status;
    if (col === "OPEN" && d.status === "REOPENED") reopened++;
    byStatus.get(col)?.push(d);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">
          Board <span className="text-sm font-normal text-zinc-400">({defects.length})</span>
        </h1>
        {canCreate && (
          <Link
            href={`/projects/${projectId}/defects/new`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            + New defect
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {BOARD_COLUMNS.map((col) => {
          const items = byStatus.get(col) ?? [];
          return (
            <div key={col} className="rounded-lg bg-zinc-100/70 p-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {STATUS_LABEL[col]}
                </span>
                <span className="text-xs text-zinc-400">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((d) => (
                  <Link
                    key={d.id}
                    href={`/projects/${projectId}/defects/${d.id}`}
                    className="block rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-xs text-zinc-400">
                        {project?.key}-{d.number}
                      </span>
                      {d.status === "REOPENED" && (
                        <Badge className={STATUS_BADGE.REOPENED}>Reopened</Badge>
                      )}
                    </div>
                    <p className="mb-2 text-sm font-medium text-zinc-800">{d.title}</p>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge className={PRIORITY_BADGE[d.priority]}>{d.priority}</Badge>
                      <Badge className={SEVERITY_BADGE[d.severity]}>{d.severity}</Badge>
                      {d.assignee && (
                        <span className="ml-auto truncate text-xs text-zinc-400">
                          {d.assignee.name ?? d.assignee.email}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-zinc-400">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {reopened > 0 && (
        <p className="mt-3 text-xs text-zinc-400">
          {reopened} reopened defect{reopened === 1 ? "" : "s"} shown in the Open column.
        </p>
      )}
    </>
  );
}
