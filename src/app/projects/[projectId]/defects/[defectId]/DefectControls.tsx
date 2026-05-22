"use client";

import { useActionState } from "react";
import type { DefectStatus, Severity, Priority } from "@prisma/client";
import { updateDefect } from "@/lib/actions/defects";
import {
  STATUS_VALUES,
  STATUS_LABEL,
  SEVERITY_VALUES,
  PRIORITY_VALUES,
  PRIORITY_LABEL,
} from "@/lib/ui";

const select =
  "block w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

type Member = { id: string; name: string | null; email: string };

export function DefectControls({
  projectId,
  defectId,
  status,
  severity,
  priority,
  assigneeId,
  members,
}: {
  projectId: string;
  defectId: string;
  status: DefectStatus;
  severity: Severity;
  priority: Priority;
  assigneeId: string | null;
  members: Member[];
}) {
  const action = updateDefect.bind(null, projectId, defectId);
  const [state, formAction] = useActionState(action, undefined);

  // Each <select> submits the whole form on change. Unchanged fields are sent
  // too, but updateDefect only logs/persists the values that actually differ.
  const submitOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.currentTarget.form?.requestSubmit();
  };

  // Key each select to its server value so it remounts (and re-applies the
  // fresh defaultValue) after an action revalidates; otherwise React keeps the
  // old uncontrolled DOM value and the dropdown drifts from the real state.
  return (
    <form action={formAction} className="space-y-3 text-sm">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Status</label>
        <select key={status} name="status" defaultValue={status} onChange={submitOnChange} className={select}>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Severity</label>
        <select key={severity} name="severity" defaultValue={severity} onChange={submitOnChange} className={select}>
          {SEVERITY_VALUES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Priority</label>
        <select key={priority} name="priority" defaultValue={priority} onChange={submitOnChange} className={select}>
          {PRIORITY_VALUES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Assignee</label>
        <select
          key={assigneeId ?? "__unassign__"}
          name="assigneeId"
          defaultValue={assigneeId ?? "__unassign__"}
          onChange={submitOnChange}
          className={select}
        >
          <option value="__unassign__">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name ?? m.email}
            </option>
          ))}
        </select>
      </div>
      <noscript>
        <button type="submit" className="rounded bg-indigo-600 px-2 py-1 text-xs text-white">
          Save
        </button>
      </noscript>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
