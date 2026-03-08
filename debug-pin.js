const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
    const user = await p.user.findFirst({
        where: { phone: '+919941292729' },
        select: { id: true, name: true, phone: true, pin: true, role: true }
    });
    console.log('User:', JSON.stringify(user, null, 2));

    if (user && user.pin) {
        const match = await bcrypt.compare('1234', user.pin);
        console.log('PIN "1234" matches:', match);
    } else {
        console.log('No PIN set on this user!');
    }
}

main().finally(() => p.$disconnect());
