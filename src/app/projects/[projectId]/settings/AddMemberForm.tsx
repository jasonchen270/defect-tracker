"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMember } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/SubmitButton";
import { ROLE_VALUES, ROLE_LABEL } from "@/lib/ui";

const field =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function AddMemberForm({ projectId }: { projectId: string }) {
  const action = addMember.bind(null, projectId);
  const [state, formAction] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="person@example.com"
          className={field + " flex-1"}
        />
        <select name="role" defaultValue="MEMBER" className={field}>
          {ROLE_VALUES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <SubmitButton>Add</SubmitButton>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
