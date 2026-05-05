const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();

const assetGroups = [
  { id: 11000, name: "Currencies" },
  { id: 10010, name: "Stocks" },
  { id: 10100, name: "Commodities" },
  { id: 10001, name: "Indices" },
  { id: 11100, name: "Crypto" },
];

async function main() {
  for (const assetGroup of assetGroups) {
    await prisma.assetGroup.upsert({
      where: {
        id: assetGroup.id,
      },
      create: assetGroup,
      update: {
        name: assetGroup.name,
      },
    });
  }

  console.log(`Seeded ${assetGroups.length} asset groups`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
