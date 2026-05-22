import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectRole, atLeast } from "@/lib/rbac";
import { fmtDate } from "@/lib/ui";
import { AddMemberForm } from "./AddMemberForm";
import { MemberRow } from "./MemberRow";

export default async function ProjectSettings({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const role = await projectRole(projectId);
  if (!role || !atLeast(role, "MANAGER")) redirect(`/projects/${projectId}`);
  const isOwner = atLeast(role, "OWNER");

  const memberships = await prisma.membership.findMany({
    where: { projectId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-lg font-semibold text-zinc-900">Project settings</h1>

      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Members</h2>
        <ul className="divide-y divide-zinc-100">
          {memberships.map((m) => (
            <MemberRow
              key={m.id}
              projectId={projectId}
              membershipId={m.id}
              name={m.user.name ?? m.user.email}
              email={m.user.email}
              role={m.role}
              joined={fmtDate(m.createdAt)}
              canManage={isOwner}
            />
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Add a member</h2>
        <p className="mb-3 text-xs text-zinc-400">
          The person must already have a registered account.
        </p>
        <AddMemberForm projectId={projectId} />
      </section>
    </div>
  );
}
