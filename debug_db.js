const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
    try {
        const users = await prisma.user.findMany();
        console.log('User count:', users.length);
        console.table(users.map(u => ({ id: u.id, name: u.name, role: u.role })));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
checkDb();
