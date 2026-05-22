import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

// Project key: short, uppercase, used as the human prefix for defect numbers
// (e.g. WEB-12). Letters and digits only, must start with a letter.
export const projectSchema = z.object({
  key: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z][A-Z0-9]{1,9}$/, "2-10 chars, letters/digits, starts with a letter"),
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const defectStatus = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
]);
export const severity = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const priority = z.enum(["P3", "P2", "P1", "P0"]);
export const projectRole = z.enum(["OWNER", "MANAGER", "MEMBER", "VIEWER"]);

export const createDefectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  severity,
  priority,
  assigneeId: z.string().cuid().optional().or(z.literal("")),
});

export const updateDefectSchema = z.object({
  status: defectStatus.optional(),
  severity: severity.optional(),
  priority: priority.optional(),
  assigneeId: z.string().cuid().optional().or(z.literal("")).or(z.literal("__unassign__")),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment can't be empty").max(5000),
});

export const memberSchema = z.object({
  email: z.string().email(),
  role: projectRole,
});

export const memberRoleSchema = z.object({
  membershipId: z.string().cuid(),
  role: projectRole,
});
