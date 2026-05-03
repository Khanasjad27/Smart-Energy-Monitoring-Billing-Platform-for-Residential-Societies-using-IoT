const prisma = require('../../config/prisma');

const getAggregatedFlatIds = async (flatId, userId) => {
    if (flatId === 'society') {
        const adminUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!adminUser || !adminUser.societyId) throw new Error("No society associated");
        const flats = await prisma.flat.findMany({ where: { societyId: adminUser.societyId } });
        return flats.map(f => f.id);
    }
    if (flatId === 'builder') {
        const flats = await prisma.flat.findMany();
        return flats.map(f => f.id);
    }
    if (flatId.startsWith('society_')) {
        const societyId = Number(flatId.split('_')[1]);
        const flats = await prisma.flat.findMany({ where: { societyId } });
        return flats.map(f => f.id);
    }
    return null;
};

const generateBillByFlat = async (req, res) => {
    const { flatId } = req.params;

    if (!flatId) {
        return res.status(400).json({ message: "Flat ID is required" });
    }

    try {
        const flat = await prisma.flat.findUnique({
            where: { id: Number(flatId) }
        });

        if (!flat) {
            return res.status(404).json({ message: "Flat not found" });
        }

        if (req.user.role === "USER") {
            if (flat.ownerId !== req.user.id) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }
        }
        const society = await prisma.society.findUnique({
            where: { id: flat.societyId }
        });

        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        // Fetch all readings for the current month, sorted by date
        const monthlyReadings = await prisma.meterReading.findMany({
            where: { 
                flatId: Number(flatId),
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            orderBy: { date: "asc" }
        });

        if (monthlyReadings.length < 2) {
            // If we don't have enough readings THIS month, fallback to the latest 2 readings ever recorded
            const fallbackReadings = await prisma.meterReading.findMany({
                where: { flatId: Number(flatId) },
                orderBy: { date: "desc" },
                take: 2
            });

            if (fallbackReadings.length < 2) {
                 return res.status(400).json({ message: "Not enough data to generate bill" });
            }
            monthlyReadings.push(fallbackReadings[1], fallbackReadings[0]);
        }

        const firstReading = monthlyReadings[0];
        const latestReading = monthlyReadings[monthlyReadings.length - 1];

        const unitsConsumed = latestReading.unit - firstReading.unit;

        if (unitsConsumed < 0) {
            return res.status(400).json({
                message: "Invalid data: Latest reading is smaller than first reading."
            });
        }

        const rate = society.ratePerUnit;
        const totalAmount = unitsConsumed * rate;

        // Check if a bill for THIS month already exists
        const existingBill = await prisma.bill.findFirst({
            where: { 
                flatId: Number(flatId),
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        if (existingBill) {
            // Update the existing bill for the month instead of creating a duplicate
            await prisma.bill.update({
                where: { id: existingBill.id },
                data: {
                    units: unitsConsumed,
                    amount: totalAmount
                }
            });

            return res.status(200).json({
                flatId: Number(flatId),
                unitsConsumed,
                rate,
                totalAmount,
                message: "Monthly bill updated successfully"
            });
        }

        // Create a new bill if one doesn't exist for this month
        await prisma.bill.create({
            data: {
                flatId: Number(flatId),
                units: unitsConsumed,
                amount: totalAmount
            }
        });

        return res.status(201).json({
            flatId: Number(flatId),
            unitsConsumed,
            rate,
            totalAmount,
            message: "New monthly bill generated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


const getBillingHistory = async (req, res) => {
    const { flatId } = req.params;

    if (!flatId) {
        return res.status(400).json({
            message: "Flat ID is required"
        });
    }

    try {
        const aggregatedIds = await getAggregatedFlatIds(flatId, req.user.id);
        
        if (aggregatedIds !== null) {
            if (aggregatedIds.length === 0) return res.status(200).json([]);

            const bills = await prisma.bill.findMany({
                where: { flatId: { in: aggregatedIds } },
                orderBy: { createdAt: "desc" }
            });

            // Group by month
            const monthlyAgg = {};
            bills.forEach(bill => {
                const date = new Date(bill.createdAt);
                const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                
                if (!monthlyAgg[monthKey]) {
                    monthlyAgg[monthKey] = {
                        id: `agg-${monthKey}`,
                        createdAt: date,
                        units: 0,
                        amount: 0
                    };
                }
                monthlyAgg[monthKey].units += bill.units;
                monthlyAgg[monthKey].amount += bill.amount;
            });

            const aggregatedBills = Object.values(monthlyAgg).sort((a, b) => b.createdAt - a.createdAt);
            return res.status(200).json(aggregatedBills);
        }

        const bills = await prisma.bill.findMany({
            where: { flatId: Number(flatId) },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json(bills);

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching billing history",
            error: error.message
        });
    }
};

module.exports = {
    generateBillByFlat,
    getBillingHistory
};