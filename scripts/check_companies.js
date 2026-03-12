const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const companies = await prisma.company.findMany();
  companies.forEach(c => {
    console.log(`ID: ${c.id} | Name: ${c.name} | Logo: ${c.logo}`);
  });
  await prisma.$disconnect();
}

check();
