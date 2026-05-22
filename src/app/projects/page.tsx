import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserId, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { NavBar } from "@/components/NavBar";
import { Badge } from "@/components/Badge";
import { ROLE_LABEL } from "@/lib/ui";
import { NewProjectForm } from "./NewProjectForm";

export default async function ProjectsPage() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    throw e;
  }

  const memberships = await prisma.membership.findMany({
    where: { userId },
    orderBy: { project: { name: "asc" } },
    select: {
      role: true,
      project: {
        select: {
          id: true,
          key: true,
          name: true,
          description: true,
          _count: { select: { defects: true } },
        },
      },
    },
  });

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">Projects</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="md:col-span-2">
            {memberships.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
                You&apos;re not a member of any project yet. Create one to get started.
              </p>
            ) : (
              <ul className="space-y-3">
                {memberships.map(({ role, project }) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-600">
                            {project.key}
                          </span>
                          <span className="font-medium text-zinc-900">{project.name}</span>
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-600/20">
                          {ROLE_LABEL[role]}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                          {project.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-zinc-400">
                        {project._count.defects} defect{project._count.defects === 1 ? "" : "s"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-zinc-900">New project</h2>
              <NewProjectForm />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
