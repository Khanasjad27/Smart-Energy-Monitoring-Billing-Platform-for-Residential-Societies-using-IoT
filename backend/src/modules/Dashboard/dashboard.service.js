const prisma = require('../../config/prisma');

const getFlatSummary = async (req, res) => {
    const { flatId } = req.params;

    if (!flatId) {
        return res.status(400).json({
            message: "Flat ID is required"
        });
    }

    try {
        const flat = await prisma.flat.findUnique({ where: { id: Number(flatId) } });
        if (!flat) {
            return res.status(404).json({
                message: "Flat not found"
            });
        }
        const society = await prisma.society.findUnique({
            where: { id: flat.societyId }
        });


        const allReadings = await prisma.meterReading.findMany({ where: { flatId: Number(flatId) }, orderBy: { createdAt: "asc" } });
        const rate = society.ratePerUnit;
        const firstReading = allReadings[0]?.unit || 0;
        const lastReading = allReadings[allReadings.length - 1]?.unit || 0;
        const totalUnits = lastReading - firstReading;

        if (totalUnits < 0) {
            return res.status(400).json({
                message: "Invalid readings. Last reading is less than first reading."
            });
        }

        if (allReadings.length < 2) {
            return res.status(200).json({
                flatId: flat.id,
                flatNumber: flat.flatNumber,
                totalUnits: 0,
                totalAmount: 0
            });
        }
        const totalAmount = totalUnits * rate;
        return res.status(200).json({
            flatId: flat.id,
            flatNumber: flat.flatNumber,
            totalUnits,
            totalAmount
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

const getMonthlyUsage = async (req, res) => {
    const { flatId } = req.params;

    if (!flatId) {
        return res.status(400).json({ message: "Flat ID is required" });
    }

    try {
        const readings = await prisma.meterReading.findMany({
            where: { flatId: Number(flatId) },
            orderBy: { createdAt: "asc" }
        });

        if (readings.length < 2) {
            return res.status(200).json([]);
        }

        const monthlyData = {};

        readings.forEach((r) => {
            const date = new Date(r.createdAt);
            const month = date.toLocaleString("default", { month: "short" });

            if (!monthlyData[month]) {
                monthlyData[month] = {
                    first: r.unit,
                    last: r.unit
                };
            } else {
                monthlyData[month].last = r.unit;
            }
        });

        const result = Object.keys(monthlyData).map((month) => {
            return {
                month,
                units: monthlyData[month].last - monthlyData[month].first
            };
        });

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching monthly usage",
            error: error.message
        });
    }
};

module.exports = {
    getFlatSummary,
    getMonthlyUsage
};