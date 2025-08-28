import { prisma } from "@/lib/prisma";
import fs from "fs";

async function run() {
  const file = "./data/prompts.json"; // adjust path if needed
  if (!fs.existsSync(file)) {
    console.error("File not found:", file);
    process.exit(1);
  }
  const items = JSON.parse(fs.readFileSync(file, "utf8")) as Array<{
    key: string; title: string; body: string; tags?: string[];
  }>;
  for (const it of items) {
    await prisma.prompt.upsert({
      where: { key: it.key },
      update: { title: it.title, body: it.body, tags: it.tags ?? [] },
      create: { key: it.key, title: it.title, body: it.body, tags: it.tags ?? [], version: 1, checksum: "import" },
    });
  }
  console.log(`Imported ${items.length} prompts.`);
}

run().finally(async () => {
  await prisma.$disconnect();
});

