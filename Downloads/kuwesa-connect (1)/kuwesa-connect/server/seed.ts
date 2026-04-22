import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { adminUsers, leaders } from "../shared/schema";

async function seed() {
  console.log("Seeding data;.; base...");

  const email = "kuwesa23@gmail.com";
  const password = "Facebook@2025";
  const hash = await bcrypt.hash(password, 12);

  await db.insert(adminUsers).values({ email, passwordHash: hash }).onConflictDoNothing();
  console.log(`Admin user created: ${email}`);

  const existingLeaders = await db.select().from(leaders);
  if (existingLeaders.length === 0) {
    await db.insert(leaders).values([
      { name: "AGREY CHACHA", role: "President", phone: "+254745523865", sortOrder: 1 },
      { name: "SHARON ATIEGO", role: "Vice President", phone: null, sortOrder: 2 },
    ]);
    console.log("Default leaders seeded.");
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
