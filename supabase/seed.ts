/**
 * FlipBiz seed script.
 *
 * Pre-requisites:
 *   1. The 4 migrations in supabase/migrations/ have been applied to your DB.
 *   2. .env.local contains:
 *        NEXT_PUBLIC_SUPABASE_URL
 *        SUPABASE_SERVICE_ROLE_KEY  (DO NOT commit, server-only)
 *
 * Run:    pnpm db:seed
 *
 * Idempotency: re-running is safe — the script clears existing demo data
 * (purchases, sales, expenses, articles, audit_log) before re-seeding,
 * and skips user creation if the demo emails already exist.
 */

import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------
const DEMO_USERS = [
  {
    email: "alex@flipbiz.local",
    password: "flipbiz123",
    metadata: {
      username: "alex",
      full_name: "Alex Martin",
      color: "#6366f1",
    },
  },
  {
    email: "mehdi@flipbiz.local",
    password: "flipbiz123",
    metadata: {
      username: "mehdi",
      full_name: "Mehdi Benali",
      color: "#10b981",
    },
  },
  {
    email: "sarah@flipbiz.local",
    password: "flipbiz123",
    metadata: {
      username: "sarah",
      full_name: "Sarah Lefèvre",
      color: "#f59e0b",
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function ensureUser(
  user: (typeof DEMO_USERS)[number],
): Promise<string> {
  // Check if user already exists
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === user.email);
  if (existing) {
    console.log(`  • ${user.email} already exists (id=${existing.id})`);
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: user.metadata,
  });
  if (error || !data.user) {
    throw new Error(`Failed to create ${user.email}: ${error?.message}`);
  }
  console.log(`  ✓ Created ${user.email} (id=${data.user.id})`);
  return data.user.id;
}

async function clearDemoData(client: SupabaseClient<Database>) {
  // Order matters: child tables first
  await client.from("audit_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("sales").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("purchases").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("expenses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("articles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

// ---------------------------------------------------------------------------
// Article fixtures
// ---------------------------------------------------------------------------
type SeedArticle = {
  category: Database["public"]["Enums"]["article_category"];
  name: string;
  brand: string;
  reference?: string;
  size?: string;
  colorway?: string;
  serial_number?: string;
  condition: Database["public"]["Enums"]["article_condition"];
  has_certificate?: boolean;
  certificate_number?: string;
  has_original_box?: boolean;
  has_accessories?: boolean;
  accessories_description?: string;
  tags?: string[];
  // Demo-only fields used by seed (not in DB schema):
  buy_days_ago: number;
  buy_price: number;
  buy_platform: string;
  shipping_in?: number;
  packaging?: number;
  authentication?: number;
  // If sold:
  sell_days_ago?: number;
  sell_price?: number;
  sell_platform?: string;
  shipping_out?: number;
  fees_pct?: number;
};

const ARTICLES: SeedArticle[] = [
  // -------- Sneakers (8) --------
  {
    category: "sneakers",
    name: "Air Jordan 4 Retro Bred",
    brand: "Nike",
    reference: "308497-060",
    size: "42",
    colorway: "Black/Cement Grey/Summit White",
    condition: "very_good",
    has_original_box: true,
    has_accessories: true,
    tags: ["jordan", "bred"],
    buy_days_ago: 130,
    buy_price: 280,
    buy_platform: "Vinted",
    shipping_in: 12,
    sell_days_ago: 95,
    sell_price: 420,
    sell_platform: "Vinted",
    shipping_out: 0,
    fees_pct: 5,
  },
  {
    category: "sneakers",
    name: "Nike Dunk Low Panda",
    brand: "Nike",
    reference: "DD1391-100",
    size: "43",
    colorway: "White/Black",
    condition: "new_unworn",
    has_original_box: true,
    tags: ["dunk", "panda"],
    buy_days_ago: 25,
    buy_price: 95,
    buy_platform: "Vinted",
    shipping_in: 8,
  },
  {
    category: "sneakers",
    name: "Yeezy Boost 350 V2 Zebra",
    brand: "Adidas",
    reference: "CP9654",
    size: "41",
    colorway: "White/Core Black/Red",
    condition: "good",
    has_original_box: true,
    tags: ["yeezy"],
    buy_days_ago: 165,
    buy_price: 220,
    buy_platform: "Leboncoin",
    shipping_in: 10,
    sell_days_ago: 110,
    sell_price: 310,
    sell_platform: "StockX",
    shipping_out: 15,
    fees_pct: 9.5,
  },
  {
    category: "sneakers",
    name: "Air Jordan 1 High Chicago",
    brand: "Nike",
    reference: "555088-101",
    size: "44",
    colorway: "Red/White/Black",
    condition: "new_with_tags",
    has_original_box: true,
    tags: ["jordan", "chicago", "grail"],
    buy_days_ago: 55,
    buy_price: 1100,
    buy_platform: "Wethenew",
    authentication: 25,
    shipping_in: 0,
    sell_days_ago: 22,
    sell_price: 1450,
    sell_platform: "GOAT",
    shipping_out: 0,
    fees_pct: 9.5,
  },
  {
    category: "sneakers",
    name: "Travis Scott Air Jordan 1 Low Mocha",
    brand: "Nike",
    reference: "CQ4277-001",
    size: "42",
    colorway: "Sail/Dark Mocha",
    condition: "new_unworn",
    has_original_box: true,
    tags: ["jordan", "travis", "mocha", "grail"],
    buy_days_ago: 18,
    buy_price: 920,
    buy_platform: "StockX",
    authentication: 15,
    shipping_in: 20,
  },
  {
    category: "sneakers",
    name: "Nike Dunk Low UNC",
    brand: "Nike",
    reference: "DD1391-102",
    size: "41",
    colorway: "White/University Blue",
    condition: "very_good",
    has_original_box: true,
    tags: ["dunk", "unc"],
    buy_days_ago: 95,
    buy_price: 110,
    buy_platform: "Vinted",
    shipping_in: 7,
    sell_days_ago: 60,
    sell_price: 180,
    sell_platform: "Vinted",
    shipping_out: 8,
    fees_pct: 5,
  },
  {
    category: "sneakers",
    name: "Air Jordan 11 Retro Bred",
    brand: "Nike",
    reference: "378037-061",
    size: "43",
    colorway: "Black/True Red/White",
    condition: "good",
    has_original_box: false,
    tags: ["jordan", "bred"],
    buy_days_ago: 70,
    buy_price: 160,
    buy_platform: "Leboncoin",
    shipping_in: 9,
  },
  {
    category: "sneakers",
    name: "New Balance 550 White Green",
    brand: "New Balance",
    reference: "BB550WT1",
    size: "42",
    colorway: "White/Green",
    condition: "new_unworn",
    has_original_box: true,
    tags: ["new-balance"],
    buy_days_ago: 88,
    buy_price: 100,
    buy_platform: "Vinted",
    shipping_in: 7,
    sell_days_ago: 40,
    sell_price: 165,
    sell_platform: "Vinted",
    shipping_out: 9,
    fees_pct: 5,
  },

  // -------- Cards (6) --------
  {
    category: "cards",
    name: "Pokémon Dracaufeu Holo 1ère édition PSA 10",
    brand: "Pokémon",
    reference: "Set Base #4",
    serial_number: "PSA 87234567",
    condition: "new_unworn",
    has_certificate: true,
    certificate_number: "PSA 87234567",
    tags: ["pokemon", "psa-10", "vintage"],
    buy_days_ago: 145,
    buy_price: 4200,
    buy_platform: "Catawiki",
    shipping_in: 35,
    authentication: 60,
  },
  {
    category: "cards",
    name: "Pokémon Pikachu Illustrator Promo PSA 9",
    brand: "Pokémon",
    reference: "Promo",
    serial_number: "PSA 12345678",
    condition: "very_good",
    has_certificate: true,
    certificate_number: "PSA 12345678",
    tags: ["pokemon", "psa-9", "promo"],
    buy_days_ago: 118,
    buy_price: 850,
    buy_platform: "eBay",
    shipping_in: 22,
    sell_days_ago: 50,
    sell_price: 1250,
    sell_platform: "eBay",
    shipping_out: 18,
    fees_pct: 12,
  },
  {
    category: "cards",
    name: "One Piece Monkey D. Luffy OP01-016 SR Parallel",
    brand: "Bandai",
    reference: "OP01-016",
    condition: "new_unworn",
    tags: ["one-piece", "tcg"],
    buy_days_ago: 38,
    buy_price: 75,
    buy_platform: "Vinted",
    shipping_in: 4,
  },
  {
    category: "cards",
    name: "Topps F1 2023 Max Verstappen #1 Dynamic Auto",
    brand: "Topps",
    reference: "Topps Chrome F1 2023",
    condition: "new_with_tags",
    has_certificate: true,
    certificate_number: "BGS 9.5",
    tags: ["f1", "verstappen", "auto"],
    buy_days_ago: 78,
    buy_price: 320,
    buy_platform: "eBay",
    shipping_in: 12,
    sell_days_ago: 30,
    sell_price: 480,
    sell_platform: "eBay",
    shipping_out: 10,
    fees_pct: 12,
  },
  {
    category: "cards",
    name: "Topps NBA Wembanyama RC #138",
    brand: "Topps",
    reference: "Bowman U Now 2023",
    condition: "new_unworn",
    tags: ["nba", "rookie", "wembanyama"],
    buy_days_ago: 32,
    buy_price: 90,
    buy_platform: "Vinted",
    shipping_in: 5,
  },
  {
    category: "cards",
    name: "Pokémon Mewtwo Holo Base Set Shadowless PSA 10",
    brand: "Pokémon",
    reference: "Set Base #10",
    serial_number: "PSA 99887766",
    condition: "new_unworn",
    has_certificate: true,
    certificate_number: "PSA 99887766",
    tags: ["pokemon", "psa-10", "shadowless"],
    buy_days_ago: 102,
    buy_price: 1450,
    buy_platform: "Catawiki",
    shipping_in: 28,
    sell_days_ago: 35,
    sell_price: 2100,
    sell_platform: "Catawiki",
    shipping_out: 25,
    fees_pct: 9,
  },

  // -------- Watches (4) --------
  {
    category: "watches",
    name: "Rolex Submariner Date 16610",
    brand: "Rolex",
    reference: "16610",
    serial_number: "K123456",
    condition: "very_good",
    has_certificate: true,
    certificate_number: "Vinted Pro Auth #VTD-77821",
    has_original_box: true,
    has_accessories: true,
    tags: ["rolex", "submariner", "grail"],
    buy_days_ago: 155,
    buy_price: 6800,
    buy_platform: "Chrono24",
    shipping_in: 45,
    authentication: 120,
    sell_days_ago: 80,
    sell_price: 8400,
    sell_platform: "Chrono24",
    shipping_out: 60,
    fees_pct: 6.5,
  },
  {
    category: "watches",
    name: "Tudor Black Bay 58",
    brand: "Tudor",
    reference: "M79030N-0001",
    serial_number: "TUD2024-882",
    condition: "very_good",
    has_original_box: true,
    has_accessories: true,
    tags: ["tudor", "diver"],
    buy_days_ago: 42,
    buy_price: 2850,
    buy_platform: "Chrono24",
    shipping_in: 38,
    authentication: 90,
  },
  {
    category: "watches",
    name: "Seiko SKX007 modded NH36",
    brand: "Seiko",
    reference: "SKX007J1",
    serial_number: "SKX-MOD-1138",
    condition: "good",
    has_original_box: false,
    tags: ["seiko", "modded"],
    buy_days_ago: 75,
    buy_price: 280,
    buy_platform: "Leboncoin",
    shipping_in: 12,
    sell_days_ago: 28,
    sell_price: 420,
    sell_platform: "Vinted",
    shipping_out: 8,
    fees_pct: 5,
  },
  {
    category: "watches",
    name: "Omega Speedmaster Reduced",
    brand: "Omega",
    reference: "3510.50.00",
    serial_number: "OM-93847",
    condition: "good",
    has_original_box: true,
    has_accessories: false,
    tags: ["omega", "moonwatch"],
    buy_days_ago: 60,
    buy_price: 1850,
    buy_platform: "Chrono24",
    shipping_in: 32,
    authentication: 75,
  },

  // -------- Other (2) --------
  {
    category: "other",
    name: "Supreme Box Logo Hoodie FW21 Black",
    brand: "Supreme",
    reference: "BLOGO-FW21",
    size: "L",
    colorway: "Black",
    condition: "new_with_tags",
    has_accessories: true,
    accessories_description: "Sticker + sac papier",
    tags: ["supreme", "streetwear"],
    buy_days_ago: 45,
    buy_price: 380,
    buy_platform: "Vinted",
    shipping_in: 9,
  },
  {
    category: "other",
    name: "Off-White x Nike Cortez OG (poster)",
    brand: "Off-White",
    size: "Standard",
    colorway: "Multicolor",
    condition: "new_unworn",
    tags: ["off-white", "collector"],
    buy_days_ago: 12,
    buy_price: 60,
    buy_platform: "Vinted",
    shipping_in: 4,
  },
];

// ---------------------------------------------------------------------------
// Expense fixtures
// ---------------------------------------------------------------------------
const EXPENSES = [
  { category: "Emballage", description: "Carton + papier bulle (lot)", amount: 48, days_ago: 5 },
  { category: "Abonnement", description: "Abonnement StockX Pro", amount: 30, days_ago: 12 },
  { category: "Transport", description: "Train Paris–Lyon (rdv vendeur Rolex)", amount: 78, days_ago: 155 },
  { category: "Frais bancaires", description: "Commission virement Wise", amount: 12, days_ago: 30 },
  { category: "Marketing", description: "Boost annonces Vinted", amount: 25, days_ago: 18 },
  { category: "Outils", description: "Loupe + lampe UV (auth)", amount: 65, days_ago: 90 },
  { category: "Authentification", description: "Auth pré-revente Wethenew", amount: 35, days_ago: 60 },
  { category: "Emballage", description: "Stock pochettes bulles", amount: 22, days_ago: 45 },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("→ FlipBiz seed");

  console.log("\n[1/4] Ensuring demo users…");
  const userIds: string[] = [];
  for (const u of DEMO_USERS) {
    userIds.push(await ensureUser(u));
  }

  console.log("\n[2/4] Clearing existing demo data…");
  await clearDemoData(admin);

  console.log("\n[3/4] Inserting articles + purchases + sales…");
  let soldCount = 0;
  for (let i = 0; i < ARTICLES.length; i++) {
    const a = ARTICLES[i]!;
    const buyer = userIds[i % userIds.length]!;

    const { data: art, error: artErr } = await admin
      .from("articles")
      .insert({
        created_by: buyer,
        category: a.category,
        name: a.name,
        brand: a.brand,
        reference: a.reference ?? null,
        size: a.size ?? null,
        colorway: a.colorway ?? null,
        serial_number: a.serial_number ?? null,
        condition: a.condition,
        has_certificate: a.has_certificate ?? false,
        certificate_number: a.certificate_number ?? null,
        has_original_box: a.has_original_box ?? false,
        has_accessories: a.has_accessories ?? false,
        accessories_description: a.has_accessories
          ? "Boîte + papiers + factures"
          : null,
        tags: a.tags ?? [],
        photos: [],
      })
      .select("id")
      .single();
    if (artErr || !art) throw new Error(`Article insert failed: ${artErr?.message}`);

    const { error: purchErr } = await admin.from("purchases").insert({
      article_id: art.id,
      buyer_id: buyer,
      purchase_date: daysAgo(a.buy_days_ago),
      purchase_price: a.buy_price,
      purchase_platform: a.buy_platform,
      seller_name: randomElement([
        "Antoine D.",
        "Lucas M.",
        "Emma R.",
        "Karim H.",
        "Sophie L.",
        "—",
      ]),
      shipping_cost_in: a.shipping_in ?? 0,
      packaging_cost: a.packaging ?? 0,
      authentication_cost: a.authentication ?? 0,
      other_costs: 0,
    });
    if (purchErr) throw new Error(`Purchase insert failed: ${purchErr.message}`);

    if (a.sell_days_ago !== undefined && a.sell_price !== undefined) {
      const seller = userIds[(i + 1) % userIds.length]!;
      const feesPct = a.fees_pct ?? 5;
      const feesAmount = Math.round((a.sell_price * feesPct) / 100);
      const { error: saleErr } = await admin.from("sales").insert({
        article_id: art.id,
        seller_id: seller,
        sale_date: daysAgo(a.sell_days_ago),
        sale_price: a.sell_price,
        sale_platform: a.sell_platform ?? "Vinted",
        buyer_name: randomElement([
          "Thibault G.",
          "Julien P.",
          "Marina S.",
          "Adam B.",
          "—",
        ]),
        shipping_cost_out: a.shipping_out ?? 0,
        platform_fees_pct: feesPct,
        platform_fees_amount: feesAmount,
        other_fees: 0,
        payment_method: randomElement(["Carte", "PayPal", "Virement"]),
        tracking_number: `LP00${Math.floor(Math.random() * 1_000_000_000)}FR`,
      });
      if (saleErr) throw new Error(`Sale insert failed: ${saleErr.message}`);
      soldCount++;
    }
  }

  console.log("\n[4/4] Inserting expenses…");
  for (let i = 0; i < EXPENSES.length; i++) {
    const e = EXPENSES[i]!;
    const owner = userIds[i % userIds.length]!;
    const { error } = await admin.from("expenses").insert({
      user_id: owner,
      category: e.category,
      description: e.description,
      amount: e.amount,
      date: daysAgo(e.days_ago),
    });
    if (error) throw new Error(`Expense insert failed: ${error.message}`);
  }

  console.log("\n✅ Seed complete.");
  console.log(`   Users:    ${userIds.length}`);
  console.log(`   Articles: ${ARTICLES.length}  (${soldCount} sold, ${ARTICLES.length - soldCount} in stock)`);
  console.log(`   Expenses: ${EXPENSES.length}`);
  console.log("\n   Demo logins:");
  for (const u of DEMO_USERS) {
    console.log(`   - ${u.email}  /  ${u.password}`);
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
