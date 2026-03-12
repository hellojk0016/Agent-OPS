const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkAllAdmins() {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });

        console.log(`Found ${admins.length} admins.`);

        const companies = await prisma.company.findMany({
            where: {
                name: {
                    in: ['KNIGHT WOLF', 'COMMERCE AGENT']
                }
            }
        });

        for (const admin of admins) {
            for (const company of companies) {
                const existing = await prisma.companyMembership.findUnique({
                    where: {
                        userId_companyId: {
                            userId: admin.id,
                            companyId: company.id
                        }
                    }
                });

                if (!existing) {
                    await prisma.companyMembership.create({
                        data: {
                            userId: admin.id,
                            companyId: company.id
                        }
                    });
                    console.log(`Linked admin ${admin.email || admin.id} to ${company.name}`);
                } else {
                    console.log(`Admin ${admin.email || admin.id} already linked to ${company.name}`);
                }
            }
        }
    } catch (err) {
        console.error('Error linking admins:', err);
    } finally {
        await prisma.$disconnect();
    }
}

linkAllAdmins();
