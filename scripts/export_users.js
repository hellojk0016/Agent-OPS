const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      companyMembership: {
        include: { company: true }
      }
    }
  });
  fs.writeFileSync('users_verification.json', JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
