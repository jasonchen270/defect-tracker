import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectRole, atLeast } from "@/lib/rbac";
import { NewDefectForm } from "./NewDefectForm";

export default async function NewDefectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const role = await projectRole(projectId);
  if (!role || !atLeast(role, "MEMBER")) redirect(`/projects/${projectId}`);

  const members = await prisma.membership.findMany({
    where: { projectId },
    orderBy: { user: { name: "asc" } },
    select: { user: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-lg font-semibold text-zinc-900">New defect</h1>
      <NewDefectForm
        projectId={projectId}
        members={members.map((m) => m.user)}
      />
    </div>
  );
}
