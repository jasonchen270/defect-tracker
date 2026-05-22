import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/lib/actions/auth";

export async function NavBar() {
  const session = await auth();
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/projects" className="text-sm font-semibold text-zinc-900">
          🐞 Defect Tracker
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-500">{session.user.name ?? session.user.email}</span>
            <form action={logout}>
              <button className="text-zinc-600 hover:text-zinc-900">Sign out</button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
