import "dotenv/config";

async function main() {
  const { PrismaClient } = await import("../generated/prisma/client.ts");
  // Use crypto built-in to avoid bcryptjs dependency in this package.
  // bcryptjs lives in @aurora/core, so we do a manual bcrypt hash via child_process.
  const { execSync } = await import("node:child_process");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const prisma = new PrismaClient({});

  const email = process.env.ADMIN_EMAIL ?? "admin@aurora.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const fullName = "Administrador Aurora";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuario ${email} ya existe — actualizando rol a ADMIN.`);
    await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log("Rol actualizado a ADMIN.");
    await prisma.$disconnect();
    return;
  }

  // Hash password using node -e to call bcryptjs from @aurora/core context
  const hashScript = `
    const b = require('bcryptjs');
    const h = b.hashSync('${password.replace(/'/g, "\\'")}', 12);
    process.stdout.write(h);
  `;
  const bcryptjsPath = require.resolve
    ? require.resolve("bcryptjs")
    : "bcryptjs";

  const passwordHash = execSync(
    `node -e "${hashScript.replace(/\n/g, " ")}"`,
    { cwd: "../../packages/core" }
  ).toString().trim();

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      role: "ADMIN",
      termsAccepted: true,
    },
  });

  console.log(`\nAdmin creado:`);
  console.log(`  Email:      ${user.email}`);
  console.log(`  Contraseña: ${password}`);
  console.log(`  ID:         ${user.id}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
