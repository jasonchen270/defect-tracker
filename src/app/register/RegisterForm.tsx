"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

const input =
  "block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
  return (
    <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
        <input name="name" type="text" required autoComplete="name" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Email</label>
        <input name="email" type="email" required autoComplete="email" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={input}
        />
        <p className="mt-1 text-xs text-zinc-400">At least 8 characters.</p>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton className="w-full">Create account</SubmitButton>
    </form>
  );
}
