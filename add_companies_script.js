const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCompanies() {
    const companiesToAdd = [
        { name: 'KNIGHT WOLF' },
        { name: 'COMMERCE AGENT' }
    ];

    try {
        for (const company of companiesToAdd) {
            const existing = await prisma.company.findUnique({
                where: { name: company.name }
            });

            if (!existing) {
                const created = await prisma.company.create({
                    data: company
                });
                console.log(`Created company: ${created.name}`);
            } else {
                console.log(`Company already exists: ${existing.name}`);
            }
        }
    } catch (err) {
        console.error('Error adding companies:', err);
    } finally {
        await prisma.$disconnect();
    }
}

addCompanies();
