const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany();
    console.log('Total users in DB:', users.length);
    users.forEach(u => console.log(`- ${u.name} (Role: ${u.role}, Phone: ${u.phone})`));
}
check();
