const prisma = require('../../config/prisma');

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


        const readings = await prisma.meterReading.findMany({
            where: { flatId: Number(flatId) },
            orderBy: { createdAt: "desc" },
            take: 2
        });

        if (readings.length < 2) {
            return res.status(400).json({
                message: "Not enough data to generate bill"
            });
        }

        const latest = readings[0];
        const previous = readings[1];

        const unitsConsumed = latest.unit - previous.unit;

        if (unitsConsumed < 0) {
            return res.status(400).json({
                message: "Invalid data"
            });
        }

        const rate = society.ratePerUnit;
        const totalAmount = unitsConsumed * rate;

        const lastBill = await prisma.bill.findFirst({
            where: { flatId: Number(flatId) },
            orderBy: { createdAt: "desc" }
        });

        if (lastBill) {
            // check if bill already generated for latest reading
            const lastReadingTime = latest.createdAt;

            if (lastBill.createdAt >= lastReadingTime) {
                return res.status(200).json({
                    flatId: Number(flatId),
                    unitsConsumed,
                    rate,
                    totalAmount,
                    message: "Bill already generated"
                });
            }
        }

        await prisma.bill.create({
            data: {
                flatId: Number(flatId),
                units: unitsConsumed,
                amount: totalAmount
            }
        });

        return res.status(200).json({
            flatId: Number(flatId),
            unitsConsumed,
            rate,
            totalAmount
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