/**
 * set-admin-pin.js
 * Run once to set (or reset) the admin PIN in the database.
 * Usage:  node set-admin-pin.js
 *
 * Change ADMIN_PHONE and ADMIN_PIN below before running.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const ADMIN_PHONE = "+919941292729";   // Your phone
const ADMIN_PIN = "1234";            // ← Change this to your desired PIN

async function main() {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findFirst({ where: { phone: ADMIN_PHONE } });
        if (!user) {
            console.error(`❌ No user found for phone: ${ADMIN_PHONE}`);
            process.exit(1);
        }

        const hashed = await bcrypt.hash(ADMIN_PIN, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { pin: hashed, pinResetRequired: false },
        });

        console.log(`✅ PIN set successfully for ${user.name} (${ADMIN_PHONE})`);
        console.log(`   PIN: ${ADMIN_PIN}  →  stored as bcrypt hash`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
