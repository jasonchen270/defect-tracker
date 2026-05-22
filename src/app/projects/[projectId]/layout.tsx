import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureProjectAccess } from "@/lib/actions/defects";
import { atLeast } from "@/lib/rbac";
import { NavBar } from "@/components/NavBar";
import { Badge } from "@/components/Badge";
import { ROLE_LABEL } from "@/lib/ui";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const role = await ensureProjectAccess(projectId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, key: true, name: true },
  });
  if (!project) notFound();

  return (
    <>
      <NavBar />
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Link href="/projects" className="text-sm text-zinc-400 hover:text-zinc-600">
              Projects
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-600">
              {project.key}
            </span>
            <Link href={`/projects/${projectId}`} className="font-medium text-zinc-900">
              {project.name}
            </Link>
            <Badge className="ml-1 bg-indigo-50 text-indigo-700 ring-indigo-600/20">
              {ROLE_LABEL[role]}
            </Badge>
          </div>
          {atLeast(role, "MANAGER") && (
            <Link
              href={`/projects/${projectId}/settings`}
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Settings
            </Link>
          )}
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
