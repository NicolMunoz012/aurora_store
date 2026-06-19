// Crear usuario admin via pg directa.
// Correr: node packages/database/prisma/create-admin.mjs

import { createRequire } from "module";
import { randomUUID } from "crypto";
import pg from "pg";

const require = createRequire(import.meta.url);
const bcrypt = require("C:/Users/nicol/RepNic/aurora_store/node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs/index.js");

const DATABASE_URL = "postgresql://postgres:81edfccc030626c266c265a80651e4b4@6rip9ut9.us-east.database.insforge.app:5432/insforge";

const email = "admin@aurora.com";
const password = "Admin1234!";
const fullName = "Administrador Aurora";

const hash = bcrypt.hashSync(password, 12);

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Conectando a la base de datos...");
await client.connect();
console.log("Conectado.");

// Listar tablas
const tables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
console.log("Tablas en la DB:", tables.rows.map(r => r.tablename));

const existing = await client.query('SELECT id, role FROM "users" WHERE email = $1', [email]);

if (existing.rows.length > 0) {
  await client.query(
    'UPDATE "users" SET role = $1, "passwordHash" = $2 WHERE email = $3',
    ["ADMIN", hash, email]
  );
  console.log(`\nUsuario ${email} actualizado a ADMIN.`);
} else {
  await client.query(
    `INSERT INTO "users" (id, email, "fullName", "passwordHash", role, "termsAccepted", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [randomUUID(), email, fullName, hash, "ADMIN", true]
  );
  console.log(`\nAdmin creado: ${email}`);
}

console.log(`\nCredenciales de acceso:`);
console.log(`  Email:      ${email}`);
console.log(`  Contraseña: ${password}`);
console.log(`  Login:      http://localhost:3000/login`);
console.log(`  Admin:      http://localhost:3000/admin`);

await client.end();
