const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  fs.writeFileSync('company_verification.json', JSON.stringify(companies, null, 2));
}

main().finally(() => prisma.$disconnect());
