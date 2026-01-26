
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/translation_db?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const testUserId = 'cm6bt8x3p0000abcde1234567';

    console.log(`Creating test user: ${testUserId}...`);

    try {
        const user = await prisma.user.upsert({
            where: { id: testUserId },
            update: {},
            create: {
                id: testUserId,
                email: 'test@example.com',
                name: 'E2E Test User',
                image: null,
                tier: 'PRO'
            }
        });
        console.log('✅ User created:', user);
    } catch (e) {
        console.error('❌ Failed to create user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
