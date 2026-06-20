// Seed de demo: categorías + productos de belleza.
// Correr: node packages/database/prisma/seed-demo.mjs

import { randomUUID } from "crypto";
import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://postgres:81edfccc030626c266c265a80651e4b4@6rip9ut9.us-east.database.insforge.app:5432/insforge",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// Helper
function slug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// 1. Crear categorías
const categories = [
  { name: "Skincare", slug: "skincare" },
  { name: "Maquillaje", slug: "maquillaje" },
  { name: "Cabello", slug: "cabello" },
  { name: "Corporal", slug: "corporal" },
  { name: "Fragancias", slug: "fragancias" },
];

const categoryIds = {};

for (const cat of categories) {
  const existing = await client.query('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
  if (existing.rows.length > 0) {
    categoryIds[cat.slug] = existing.rows[0].id;
    console.log(`  Categoría "${cat.name}" ya existe.`);
  } else {
    const id = randomUUID();
    await client.query(
      `INSERT INTO categories (id, name, slug, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, true, NOW(), NOW())`,
      [id, cat.name, cat.slug]
    );
    categoryIds[cat.slug] = id;
    console.log(`✓ Categoría "${cat.name}" creada.`);
  }
}

// 2. Crear productos
const products = [
  {
    name: "Sérum Vitamina C Iluminador",
    description: "Sérum facial con vitamina C pura al 15%. Reduce manchas, unifica el tono y aporta luminosidad. Para todo tipo de piel.",
    retailPrice: 89900,
    wholesalePrice: 65000,
    stock: 25,
    lowStockAlert: 5,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=750&fit=crop",
  },
  {
    name: "Crema Hidratante con Ácido Hialurónico",
    description: "Hidratación profunda de 72 horas. Textura ligera, absorción inmediata. Ideal para pieles mixtas y secas.",
    retailPrice: 72000,
    wholesalePrice: 52000,
    stock: 30,
    lowStockAlert: 5,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=750&fit=crop",
  },
  {
    name: "Protector Solar SPF 50+",
    description: "Protección solar de amplio espectro. Textura invisible, no deja residuo blanco. Uso diario.",
    retailPrice: 65000,
    wholesalePrice: 47000,
    stock: 40,
    lowStockAlert: 8,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=750&fit=crop",
  },
  {
    name: "Base de Maquillaje Cobertura Media",
    description: "Base líquida de larga duración. Acabado natural satinado, 12 tonos disponibles. SPF 15.",
    retailPrice: 95000,
    wholesalePrice: 68000,
    stock: 20,
    lowStockAlert: 4,
    category: "maquillaje",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=750&fit=crop",
  },
  {
    name: "Paleta de Sombras Sunset",
    description: "12 tonos cálidos en acabado mate y shimmer. Altamente pigmentados, fácil difuminado.",
    retailPrice: 120000,
    wholesalePrice: 85000,
    stock: 15,
    lowStockAlert: 3,
    category: "maquillaje",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=750&fit=crop",
  },
  {
    name: "Labial Matte Larga Duración",
    description: "Color intenso que dura hasta 16 horas. Fórmula hidratante con vitamina E. Tono: Berry Kiss.",
    retailPrice: 45000,
    wholesalePrice: 32000,
    stock: 35,
    lowStockAlert: 7,
    category: "maquillaje",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=750&fit=crop",
  },
  {
    name: "Shampoo Reparación Profunda",
    description: "Con keratina y aceite de argán. Repara el cabello dañado desde la raíz. Libre de sulfatos.",
    retailPrice: 38000,
    wholesalePrice: 27000,
    stock: 50,
    lowStockAlert: 10,
    category: "cabello",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=750&fit=crop",
  },
  {
    name: "Aceite Capilar Nutritivo",
    description: "Blend de 7 aceites naturales. Controla el frizz, aporta brillo sin engrasar. Para todo tipo de cabello.",
    retailPrice: 52000,
    wholesalePrice: 37000,
    stock: 28,
    lowStockAlert: 5,
    category: "cabello",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=750&fit=crop",
  },
  {
    name: "Crema Corporal Manteca de Karité",
    description: "Hidratación intensiva para piel extra seca. Aroma suave a vainilla. Absorción rápida.",
    retailPrice: 42000,
    wholesalePrice: 30000,
    stock: 45,
    lowStockAlert: 8,
    category: "corporal",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=750&fit=crop",
  },
  {
    name: "Perfume Floral Eau de Parfum",
    description: "Notas de rosa, jazmín y sándalo. Duración de 8+ horas. Frasco de 50ml con atomizador.",
    retailPrice: 180000,
    wholesalePrice: 130000,
    stock: 12,
    lowStockAlert: 3,
    category: "fragancias",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=750&fit=crop",
  },
  {
    name: "Mascarilla Facial de Arcilla Verde",
    description: "Limpieza profunda y control de grasa. Con extracto de tea tree. Uso semanal recomendado.",
    retailPrice: 35000,
    wholesalePrice: 25000,
    stock: 38,
    lowStockAlert: 7,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=750&fit=crop",
  },
  {
    name: "Exfoliante Corporal de Café",
    description: "Granos de café arábica con aceite de coco. Elimina células muertas y mejora la circulación.",
    retailPrice: 32000,
    wholesalePrice: 23000,
    stock: 42,
    lowStockAlert: 8,
    category: "corporal",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&h=750&fit=crop",
  },
];

let created = 0;
for (const p of products) {
  const productSlug = slug(p.name);
  const existing = await client.query('SELECT id FROM products WHERE slug = $1', [productSlug]);
  if (existing.rows.length > 0) {
    console.log(`  Producto "${p.name}" ya existe.`);
    continue;
  }

  const productId = randomUUID();
  await client.query(
    `INSERT INTO products (id, name, slug, description, "retailPrice", "wholesalePrice", stock, "lowStockAlert", "categoryId", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())`,
    [productId, p.name, productSlug, p.description, p.retailPrice, p.wholesalePrice, p.stock, p.lowStockAlert, categoryIds[p.category]]
  );

  // Add image
  await client.query(
    `INSERT INTO product_images (id, "productId", url, "altText", "displayOrder", "createdAt")
     VALUES ($1, $2, $3, $4, 0, NOW())`,
    [randomUUID(), productId, p.image, p.name]
  );

  created++;
  console.log(`✓ Producto "${p.name}" creado.`);
}

console.log(`\n✅ Demo seed completo: ${created} productos nuevos creados.`);
console.log(`   → Ve a http://localhost:3000/catalog para verlos.`);

await client.end();
