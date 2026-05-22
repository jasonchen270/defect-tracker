import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/projects");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-zinc-900">
          🐞 Defect Tracker
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500">Sign in to your account</p>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
