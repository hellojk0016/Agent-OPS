
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  companies.forEach(c => console.log(`COMPANY_NAME: ${c.name}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
