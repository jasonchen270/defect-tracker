"use server";

import { redirect } from "next/navigation";
import { AuthError as NextAuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { registerSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/actions/projects";

/** Register a new user, then sign them in. */
export async function register(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({ data: { name, email, passwordHash } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "An account with that email already exists" };
    }
    throw e;
  }

  await signIn("credentials", { email, password, redirectTo: "/projects" });
  return undefined;
}

/** Sign in with email + password. */
export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/projects" });
  } catch (e) {
    // NextAuth throws a redirect on success; only treat real auth errors as failures.
    if (e instanceof NextAuthError) {
      return { error: "Invalid email or password" };
    }
    throw e;
  }
  return undefined;
}

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/login");
}
