const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Database Seeding...');

    // 1. Clean existing data (Optional but good for fresh test)
    await prisma.bill.deleteMany();
    await prisma.meterReading.deleteMany();
    await prisma.flat.deleteMany();
    await prisma.user.deleteMany();
    await prisma.society.deleteMany();
    await prisma.builder.deleteMany();

    console.log('🧹 Cleaned existing database records.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 2. Create Builder
    const builder = await prisma.builder.create({
        data: {
            name: 'Apex Developers',
            location: 'Mumbai, Maharashtra',
        }
    });

    // 3. Create Society
    const society = await prisma.society.create({
        data: {
            name: 'Greenwood Residency',
            address: 'Andheri West, Mumbai',
            builderId: builder.id,
            ratePerUnit: 7 // ₹7 per kWh
        }
    });

    // 4. Create Users (One of each role + additional residents)
    const builderAdmin = await prisma.user.create({
        data: {
            firstName: 'Apex',
            lastName: 'Admin',
            email: 'builder@test.com',
            password: hashedPassword,
            role: 'BUILDER_ADMIN'
        }
    });

    const societyAdmin = await prisma.user.create({
        data: {
            firstName: 'Greenwood',
            lastName: 'Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'SOCIETY_ADMIN',
            societyId: society.id
        }
    });

    // Create 3 residents
    const residents = [];
    for (let i = 1; i <= 3; i++) {
        const resident = await prisma.user.create({
            data: {
                firstName: `Resident`,
                lastName: `${i}`,
                email: `user${i}@test.com`,
                password: hashedPassword,
                role: 'USER',
                societyId: society.id
            }
        });
        residents.push(resident);
    }

    // 5. Create Flats for the residents
    const flats = [];
    for (let i = 0; i < 3; i++) {
        const flat = await prisma.flat.create({
            data: {
                flatNumber: 100 + i + 1,
                floor: 1,
                societyId: society.id,
                ownerId: residents[i].id
            }
        });
        flats.push(flat);
    }

    // 6. Generate Realistic Meter Readings for the Charts
    console.log('📈 Generating realistic meter readings for 3 flats...');
    
    const today = new Date();
    
    // For each flat, generate 7 days of historical data, plus today's breakdown
    for (const flat of flats) {
        let currentTotalUnits = Math.floor(Math.random() * 500) + 1000; // Starting reading between 1000 and 1500
        
        // Last 6 days data
        for (let i = 6; i >= 1; i--) {
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - i);
            
            // Add random units between 10 and 25 per day
            currentTotalUnits += Math.floor(Math.random() * 15) + 10;
            
            await prisma.meterReading.create({
                data: {
                    flatId: flat.id,
                    unit: currentTotalUnits,
                    date: pastDate,
                    createdAt: pastDate
                }
            });
        }

        // Today's Breakdown (Morning, Afternoon, Evening, Night)
        const timeSlots = [
            { hours: 8, add: Math.floor(Math.random() * 5) + 2 },   // Morning
            { hours: 14, add: Math.floor(Math.random() * 6) + 4 },  // Afternoon
            { hours: 19, add: Math.floor(Math.random() * 8) + 6 },  // Evening
            { hours: 23, add: Math.floor(Math.random() * 3) + 1 }   // Night
        ];

        for (const slot of timeSlots) {
            const slotDate = new Date(today);
            slotDate.setHours(slot.hours, 0, 0, 0);
            
            currentTotalUnits += slot.add;
            
            await prisma.meterReading.create({
                data: {
                    flatId: flat.id,
                    unit: currentTotalUnits,
                    date: slotDate,
                    createdAt: slotDate
                }
            });
        }

        // 7. Generate a past Bill for each flat
        const pastBillDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
        await prisma.bill.create({
            data: {
                flatId: flat.id,
                units: 145,
                amount: 145 * society.ratePerUnit,
                createdAt: pastBillDate
            }
        });
    }

    console.log('✅ Seeding complete!');
    console.log('\n--- 🔑 SAMPLE ACCOUNTS ---');
    console.log('Role          | Email              | Password');
    console.log('------------------------------------------------');
    console.log('BUILDER_ADMIN | builder@test.com   | password123');
    console.log('SOCIETY_ADMIN | admin@test.com     | password123');
    console.log('USER 1        | user1@test.com     | password123');
    console.log('USER 2        | user2@test.com     | password123');
    console.log('USER 3        | user3@test.com     | password123');
    console.log('------------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
