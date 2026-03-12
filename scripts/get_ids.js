const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  console.log('START_DATA');
  for (const c of companies) {
    if (c.name.includes('Commerce') || c.name.includes('Knight')) {
      console.log(`JSON_ID: ${JSON.stringify({id: c.id, name: c.name})}`);
    }
  }
  console.log('END_DATA');
}

main().finally(() => prisma.$disconnect());
