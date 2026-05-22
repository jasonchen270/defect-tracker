"use client";

import { useActionState } from "react";
import type { ProjectRole } from "@prisma/client";
import { changeMemberRole, removeMember } from "@/lib/actions/projects";
import { ROLE_VALUES, ROLE_LABEL } from "@/lib/ui";

export function MemberRow({
  projectId,
  membershipId,
  name,
  email,
  role,
  joined,
  canManage,
}: {
  projectId: string;
  membershipId: string;
  name: string;
  email: string;
  role: ProjectRole;
  joined: string;
  canManage: boolean;
}) {
  const action = changeMemberRole.bind(null, projectId);
  const [state, formAction] = useActionState(action, undefined);

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-800">{name}</p>
        <p className="truncate text-xs text-zinc-400">
          {email} · joined {joined}
        </p>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>

      {canManage ? (
        <div className="flex items-center gap-2">
          <form action={formAction}>
            <input type="hidden" name="membershipId" value={membershipId} />
            <select
              name="role"
              defaultValue={role}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              {ROLE_VALUES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </form>
          <form action={removeMember.bind(null, projectId, membershipId)}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </form>
        </div>
      ) : (
        <span className="text-xs font-medium text-zinc-500">{ROLE_LABEL[role]}</span>
      )}
    </li>
  );
}
