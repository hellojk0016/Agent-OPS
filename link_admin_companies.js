const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkAdmin() {
    try {
        const adminEmail = 'admin@agentsops.com';
        const user = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!user) {
            console.error('Admin user not found');
            return;
        }

        const companies = await prisma.company.findMany({
            where: {
                name: {
                    in: ['KNIGHT WOLF', 'COMMERCE AGENT']
                }
            }
        });

        for (const company of companies) {
            const existing = await prisma.companyMembership.findUnique({
                where: {
                    userId_companyId: {
                        userId: user.id,
                        companyId: company.id
                    }
                }
            });

            if (!existing) {
                await prisma.companyMembership.create({
                    data: {
                        userId: user.id,
                        companyId: company.id
                    }
                });
                console.log(`Linked ${adminEmail} to ${company.name}`);
            } else {
                console.log(`${adminEmail} already linked to ${company.name}`);
            }
        }
    } catch (err) {
        console.error('Error linking admin:', err);
    } finally {
        await prisma.$disconnect();
    }
}

linkAdmin();
