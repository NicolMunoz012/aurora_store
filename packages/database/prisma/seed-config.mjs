import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://postgres:81edfccc030626c266c265a80651e4b4@6rip9ut9.us-east.database.insforge.app:5432/insforge",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const existing = await client.query("SELECT id FROM store_config LIMIT 1");
if (existing.rows.length > 0) {
  console.log("StoreConfig ya existe.");
} else {
  await client.query(`
    INSERT INTO store_config (id, "wholesaleThreshold", "whatsappNumber", "storePhysicalAddress", "anonOrderExpiryDays", "registeredOrderExpiryDays", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 500000, '573001234567', 'Calle 123 #45-67, Bogotá', 5, 30, NOW(), NOW())
  `);
  console.log("StoreConfig creado.");
}

await client.end();
