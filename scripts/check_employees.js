const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.user.findMany({
    include: {
      companyMembership: {
        include: { company: true }
      }
    }
  });

  employees.forEach(emp => {
    const companies = emp.companyMembership.map(m => m.company.name);
    console.log(`Employee: ${emp.name} (${emp.role}) - Companies: ${companies.join(', ')}`);
  });
}

main().finally(() => prisma.$disconnect());
