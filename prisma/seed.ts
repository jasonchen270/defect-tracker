import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { email: "alice@example.com", name: "Alice Owner", passwordHash: password },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { email: "bob@example.com", name: "Bob Member", passwordHash: password },
  });

  const existing = await prisma.project.findUnique({ where: { key: "WEB" } });
  if (existing) {
    console.log("Seed already applied (project WEB exists). Skipping.");
    return;
  }

  const project = await prisma.project.create({
    data: {
      key: "WEB",
      name: "Website",
      description: "Public marketing site and customer portal.",
      memberships: {
        create: [
          { userId: alice.id, role: "OWNER" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
    },
  });

  const seed = [
    { title: "Login button unresponsive on Safari", severity: "HIGH", priority: "P1", status: "OPEN", assigneeId: bob.id },
    { title: "Checkout total miscalculates tax for EU", severity: "CRITICAL", priority: "P0", status: "IN_PROGRESS", assigneeId: bob.id },
    { title: "Footer links 404 after deploy", severity: "MEDIUM", priority: "P2", status: "RESOLVED", assigneeId: null },
    { title: "Typo on pricing page", severity: "LOW", priority: "P3", status: "CLOSED", assigneeId: null },
  ] as const;

  let n = 0;
  for (const d of seed) {
    n++;
    await prisma.defect.create({
      data: {
        projectId: project.id,
        number: n,
        title: d.title,
        severity: d.severity,
        priority: d.priority,
        status: d.status,
        reporterId: alice.id,
        assigneeId: d.assigneeId,
        resolvedAt: d.status === "RESOLVED" || d.status === "CLOSED" ? new Date() : null,
        closedAt: d.status === "CLOSED" ? new Date() : null,
      },
    });
  }

  console.log("Seeded: alice@example.com / bob@example.com (password: password123), project WEB with 4 defects.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
