const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    console.log('Cleaning up duplicate bills...');
    const bills = await prisma.bill.findMany({
        orderBy: { id: 'desc' }
    });

    let kept = {};
    let toDelete = [];

    for (let b of bills) {
        const key = b.flatId + '_' + b.createdAt.getMonth() + '_' + b.createdAt.getFullYear();
        if (!kept[key]) {
            kept[key] = true;
        } else {
            toDelete.push(b.id);
        }
    }

    if (toDelete.length > 0) {
        await prisma.bill.deleteMany({
            where: { id: { in: toDelete } }
        });
        console.log(`Successfully deleted ${toDelete.length} duplicate bills.`);
    } else {
        console.log('No duplicate bills found.');
    }
}

clean().catch(console.error).finally(() => prisma.$disconnect());
