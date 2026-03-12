const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  console.log('--- ALL COMPANIES ---');
  companies.forEach(c => console.log(`"${c.name}" - ${c.id}`));
  console.log('--- END ---');
}

main().finally(() => prisma.$disconnect());
