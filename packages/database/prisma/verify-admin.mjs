import { createRequire } from "module";
import pg from "pg";

const require = createRequire(import.meta.url);
const bcrypt = require("C:/Users/nicol/RepNic/aurora_store/node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs/index.js");

const client = new pg.Client({
  connectionString: "postgresql://postgres:81edfccc030626c266c265a80651e4b4@6rip9ut9.us-east.database.insforge.app:5432/insforge",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// 1. Verificar usuario admin
const result = await client.query('SELECT id, email, "fullName", "passwordHash", role, "termsAccepted" FROM users WHERE email = $1', ["admin@aurora.com"]);
if (result.rows.length === 0) {
  console.log("❌ Usuario admin@aurora.com NO EXISTE en la DB.");
} else {
  const user = result.rows[0];
  console.log("✓ Usuario encontrado:");
  console.log(`  ID:       ${user.id}`);
  console.log(`  Email:    ${user.email}`);
  console.log(`  Nombre:   ${user.fullName}`);
  console.log(`  Role:     ${user.role}`);
  console.log(`  Terms:    ${user.termsAccepted}`);
  console.log(`  Hash:     ${user.passwordHash.substring(0, 20)}...`);

  // Verificar password
  const isValid = bcrypt.compareSync("Admin1234!", user.passwordHash);
  console.log(`  Password válido: ${isValid ? "✓ SÍ" : "❌ NO"}`);
}

// 2. Verificar StoreConfig
const configResult = await client.query("SELECT * FROM store_config LIMIT 1");
if (configResult.rows.length === 0) {
  console.log("\n❌ StoreConfig NO EXISTE.");
} else {
  console.log("\n✓ StoreConfig encontrado:");
  console.log(`  wholesaleThreshold:       ${configResult.rows[0].wholesaleThreshold}`);
  console.log(`  whatsappNumber:           ${configResult.rows[0].whatsappNumber}`);
  console.log(`  storePhysicalAddress:     ${configResult.rows[0].storePhysicalAddress}`);
  console.log(`  anonOrderExpiryDays:      ${configResult.rows[0].anonOrderExpiryDays}`);
  console.log(`  registeredOrderExpiryDays: ${configResult.rows[0].registeredOrderExpiryDays}`);
}

await client.end();
