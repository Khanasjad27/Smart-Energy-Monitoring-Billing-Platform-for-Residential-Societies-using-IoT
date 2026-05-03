const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Remove all seeded fake bills and readings
    const deleted = await prisma.bill.deleteMany({});
    const deletedR = await prisma.meterReading.deleteMany({});
    console.log(`Cleaned: ${deletedR.count} readings, ${deleted.count} bills deleted.`);
    console.log('Database is now clean. Only real user-entered data will show.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
