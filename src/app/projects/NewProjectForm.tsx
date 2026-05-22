"use client";

import { useActionState } from "react";
import { createProject } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/SubmitButton";

const input =
  "block w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function NewProjectForm() {
  const [state, action] = useActionState(createProject, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Key</label>
        <input
          name="key"
          required
          placeholder="WEB"
          className={input + " font-mono uppercase"}
          maxLength={10}
        />
        <p className="mt-1 text-xs text-zinc-400">Prefix for defect IDs, e.g. WEB-12.</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Name</label>
        <input name="name" required placeholder="Website" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Description</label>
        <textarea name="description" rows={2} className={input} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton className="w-full">Create project</SubmitButton>
    </form>
  );
}
