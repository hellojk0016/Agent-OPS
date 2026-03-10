/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await prisma.task.deleteMany({});
        await prisma.companyMembership.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.company.deleteMany({});
        console.log('Data cleared.');

        // ─── 1. Companies ───────────────────────────────────────────────
        const kw = await prisma.company.upsert({
            where: { id: 'kw' },
            update: { name: 'KnightWolf', themeColor: '#3b82f6', logo: '/kw-logo.png' },
            create: { id: 'kw', name: 'KnightWolf', themeColor: '#3b82f6', logo: '/kw-logo.png' },
        });

        const ca = await prisma.company.upsert({
            where: { id: 'commerce' },
            update: { name: 'Commerce Agents', themeColor: '#10b981', logo: '/ca-logo.png' },
            create: { id: 'commerce', name: 'Commerce Agents', themeColor: '#10b981', logo: '/ca-logo.png' },
        });

        console.log(`Created companies: ${kw.name}, ${ca.name}`);

        // ─── 2. Password hash (fallback for legacy email login) ─────────
        const password = await bcrypt.hash('password123', 10);

        // ─── 3. Users ───────────────────────────────────────────────────
        // 1 Admin — belongs to both companies
        const admin = await prisma.user.create({
            data: {
                email: 'admin@agentsops.com',
                name: 'Santhosh',
                phone: '+919941292729',   // Official Admin Number
                password,
                role: 'ADMIN',
            },
        });

        // 3 Employees
        const emp1 = await prisma.user.create({
            data: {
                email: 'emp1@agentsops.com',
                name: 'Employee 1',
                phone: '+15551234567',
                password,
                role: 'MEMBER',
            },
        });

        const emp2 = await prisma.user.create({
            data: {
                email: 'emp2@agentsops.com',
                name: 'Employee 2',
                phone: '+15559876543',
                password,
                role: 'MEMBER',
            },
        });

        console.log('Created Users: 1 Admin + 2 Employees');

        // ─── 4. Memberships ──────────────────────────────────────────────
        // Admin gets both companies
        await prisma.companyMembership.createMany({
            data: [
                { userId: admin.id, companyId: kw.id },
                { userId: admin.id, companyId: ca.id }
            ]
        });

        // Emp 1 gets KnightWolf only
        await prisma.companyMembership.create({
            data: { userId: emp1.id, companyId: kw.id }
        });

        // Emp 2 gets Commerce Agents only
        await prisma.companyMembership.create({
            data: { userId: emp2.id, companyId: ca.id }
        });

        console.log('Created Memberships: Admin (Both), Emp1 (KW), Emp2 (CA)');
        console.log('\n=== Login Reference ===');
        console.log('Admin:      +919941292729');
        console.log('Employee 1: +15551234567 (KnightWolf Only)');
        console.log('Employee 2: +15559876543 (Commerce Only)');
        console.log('========================\n');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
