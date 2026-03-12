const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating company logos...');

  const updates = [
    { id: 'commerce', logo: '/ca-logo.png' },
    { id: 'knightwolf', logo: '/knightwolf-logo.png' }
  ];

  for (const update of updates) {
    const company = await prisma.company.update({
      where: { id: update.id },
      data: { logo: update.logo },
    });
    console.log(`Updated ${company.name} logo to: ${company.logo}`);
  }

  console.log('Update complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
