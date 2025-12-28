import { ensureDbConnection } from '@/lib/prisma';

async function main() {
    console.log('--- Database Validation Loop ---');
    try {
        const success = await ensureDbConnection(5, 2000);
        if (success) {
            process.exit(0);
        } else {
            console.error('Failed to establish database connection after retries.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Critical failure during database validation:', error);
        process.exit(1);
    }
}

main();
