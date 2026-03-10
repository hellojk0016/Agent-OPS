const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminName() {
    try {
        const admin = await prisma.user.update({
            where: { phone: '+919941292729' },
            data: { name: 'Santhosh' }
        });
        console.log(`Admin name updated to: ${admin.name}`);
    } catch (err) {
        console.error('Failed to update admin name:', err);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdminName();
