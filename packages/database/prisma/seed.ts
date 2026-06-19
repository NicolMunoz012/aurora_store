import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";

// Ensure DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const prisma = new PrismaClient({});

async function main() {
  // Guard: only seed if no StoreConfig record exists yet
  const existing = await prisma.storeConfig.findFirst();

  if (existing) {
    console.log("StoreConfig already exists — skipping seed.");
    return;
  }

  const storeConfig = await prisma.storeConfig.create({
    data: {
      wholesaleThreshold: 500000,
      whatsappNumber: "573001234567",
      storePhysicalAddress: "Calle 123 #45-67, Bogotá",
      anonOrderExpiryDays: 5,
      registeredOrderExpiryDays: 30,
    },
  });

  console.log("StoreConfig seeded:", storeConfig);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
