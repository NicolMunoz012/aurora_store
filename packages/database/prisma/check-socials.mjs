import pg from "pg";
const client = new pg.Client({
  connectionString: "postgresql://postgres:81edfccc030626c266c265a80651e4b4@6rip9ut9.us-east.database.insforge.app:5432/insforge",
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const r = await client.query('SELECT "instagramUrl", "facebookUrl", "tiktokUrl", "whatsappNumber" FROM store_config LIMIT 1');
console.log("Store config socials:", r.rows[0]);
await client.end();
