import { prisma } from "@/lib/prisma";

async function main() {
  const samples = [
    { key: "rup-strategy-master", title: "Rupert — Strategy Master", body: "You are Rupert...", tags: ["rupert","strategy"] },
    { key: "dante-wall-street", title: "Dante — Wall Street Insider", body: "You are Dante...", tags: ["finance","analysis"] },
  ];
           for (const s of samples) {
           await prisma.prompt.upsert({
             where: { key: s.key },
             update: { title: s.title, body: s.body, tags: JSON.stringify(s.tags) },
             create: { key: s.key, title: s.title, body: s.body, tags: JSON.stringify(s.tags), version: 1, checksum: "seed" },
           });
         }
  console.log("Seeded prompts:", samples.length);
}

main().finally(async () => {
  await prisma.$disconnect();
});
