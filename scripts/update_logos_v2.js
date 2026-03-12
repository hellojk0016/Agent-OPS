const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating logos by name match...');

  const updates = [
    { name: 'Commerce Agents', logo: '/ca-logo.png' },
    { name: 'KnightWolf', logo: '/knightwolf-logo.png' }
  ];

  for (const update of updates) {
    const result = await prisma.company.updateMany({
      where: { name: update.name },
      data: { logo: update.logo },
    });
    console.log(`Updated ${result.count} record(s) for "${update.name}" with logo "${update.logo}"`);
  }

  console.log('Update complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
