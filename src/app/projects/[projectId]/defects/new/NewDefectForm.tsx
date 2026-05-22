"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createDefect } from "@/lib/actions/defects";
import { SubmitButton } from "@/components/SubmitButton";
import { SEVERITY_VALUES, PRIORITY_VALUES, PRIORITY_LABEL } from "@/lib/ui";

const input =
  "block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

type Member = { id: string; name: string | null; email: string };

export function NewDefectForm({
  projectId,
  members,
}: {
  projectId: string;
  members: Member[];
}) {
  const action = createDefect.bind(null, projectId);
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Title</label>
        <input name="title" required maxLength={200} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
        <textarea name="description" rows={5} className={input} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Severity</label>
          <select name="severity" defaultValue="MEDIUM" className={input}>
            {SEVERITY_VALUES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Priority</label>
          <select name="priority" defaultValue="P2" className={input}>
            {PRIORITY_VALUES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Assignee</label>
        <select name="assigneeId" defaultValue="" className={input}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name ?? m.email}
            </option>
          ))}
        </select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex items-center gap-3">
        <SubmitButton>Create defect</SubmitButton>
        <Link href={`/projects/${projectId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}
