const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Final logo update using exact IDs...');

  const updates = [
    { id: 'ecccc887-6872-4875-a18a-b519a57870b5', logo: '/ca-logo.png' },
    { id: '2a9faee7-1484-4ceb-8f92-3038b4b7e615', logo: '/knightwolf-logo.png' }
  ];

  for (const update of updates) {
    const company = await prisma.company.update({
      where: { id: update.id },
      data: { logo: update.logo },
    });
    console.log(`Updated "${company.name}" (ID: ${company.id}) logo to: ${company.logo}`);
  }

  console.log('Update successful.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
