const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- Users ---');
        console.table(users.map(u => ({ id: u.id, name: u.name, role: u.role, phone: u.phone })));

        const companies = await prisma.company.findMany();
        console.log('--- Companies ---');
        console.table(companies.map(c => ({ id: c.id, name: c.name })));

        const memberships = await prisma.companyMembership.findMany({
            include: {
                user: true,
                company: true
            }
        });
        console.log('--- Memberships ---');
        console.table(memberships.map(m => ({ 
            user: m.user.name || m.user.phone, 
            company: m.company.name 
        })));

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
checkStatus();
