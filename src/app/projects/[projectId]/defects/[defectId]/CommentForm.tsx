"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment } from "@/lib/actions/defects";
import { SubmitButton } from "@/components/SubmitButton";

export function CommentForm({
  projectId,
  defectId,
}: {
  projectId: string;
  defectId: string;
}) {
  const action = addComment.bind(null, projectId, defectId);
  const [state, formAction] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea after a successful submit (no error returned).
  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <textarea
        name="body"
        rows={3}
        required
        placeholder="Add a comment..."
        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton>Comment</SubmitButton>
      </div>
    </form>
  );
}
