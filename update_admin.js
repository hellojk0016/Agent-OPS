const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const adminId = 'edd254d6-5e98-401c-88b1-554e22c07e5c';
    const updatedUser = await prisma.user.update({
        where: { id: adminId },
        data: { name: 'Santhosh' }
    });
    console.log('Successfully updated Admin name to:', updatedUser.name);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
