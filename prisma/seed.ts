import { PrismaClient } from "@prisma/client";
import { DEFAULT_AREAS } from "./default-areas";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.lifeArea.count();
  if (count > 0) {
    console.log("Life areas already seeded — skipping.");
    return;
  }

  for (const area of DEFAULT_AREAS) {
    await prisma.lifeArea.create({ data: area });
  }

  console.log(`Seeded ${DEFAULT_AREAS.length} life areas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
