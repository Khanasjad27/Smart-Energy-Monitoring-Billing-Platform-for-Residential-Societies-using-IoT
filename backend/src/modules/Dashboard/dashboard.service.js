const prisma = require('../../config/prisma');

const getAggregatedFlatIds = async (flatId, userId) => {
    flatId = String(flatId).trim(); // ensure it's always a clean string
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
    return null; // Not an aggregated request
};

const getFlatSummary = async (req, res) => {
    const { flatId } = req.params;

    if (!flatId) {
        return res.status(400).json({
            message: "Flat ID is required"
        });
    }

    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        const aggregatedIds = await getAggregatedFlatIds(flatId, req.user.id);

        if (aggregatedIds !== null) {
            if (aggregatedIds.length === 0) {
                return res.status(200).json({
                    flatId: flatId,
                    flatNumber: 'All',
                    totalUnits: 0,
                    totalAmount: 0
                });
            }

            const currentBills = await prisma.bill.findMany({
                where: { 
                    flatId: { in: aggregatedIds },
                    createdAt: { gte: startOfMonth, lte: endOfMonth }
                }
            });

            let totalUnits = 0;
            let totalAmount = 0;
            for (const bill of currentBills) {
                totalUnits += bill.units;
                totalAmount += bill.amount;
            }

            return res.status(200).json({
                flatId: flatId,
                flatNumber: 'All',
                totalUnits,
                totalAmount
            });
        }

        const flatIdNum = Number(flatId);
        if (isNaN(flatIdNum)) {
            return res.status(400).json({ message: `Invalid flatId: '${flatId}' is not a number` });
        }

        const flat = await prisma.flat.findUnique({ where: { id: flatIdNum } });
        if (!flat) {
            return res.status(404).json({
                message: "Flat not found"
            });
        }

        const currentBill = await prisma.bill.findFirst({
            where: {
                flatId: Number(flatId),
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });

        const totalUnits = currentBill ? currentBill.units : 0;
        const totalAmount = currentBill ? currentBill.amount : 0;

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
        const aggregatedIds = await getAggregatedFlatIds(flatId, req.user.id);

        if (aggregatedIds !== null) {
            if (aggregatedIds.length === 0) return res.status(200).json([]);

            const readings = await prisma.meterReading.findMany({
                where: { flatId: { in: aggregatedIds } },
                orderBy: { createdAt: "asc" }
            });

            const monthlyData = {};

            readings.forEach((r) => {
                const date = new Date(r.createdAt);
                const month = date.toLocaleString("default", { month: "short" });
                
                if (!monthlyData[month]) monthlyData[month] = {};
                if (!monthlyData[month][r.flatId]) {
                    monthlyData[month][r.flatId] = { first: r.unit, last: r.unit };
                } else {
                    monthlyData[month][r.flatId].last = r.unit;
                }
            });

            const result = Object.keys(monthlyData).map((month) => {
                let units = 0;
                for (const flatData of Object.values(monthlyData[month])) {
                    units += (flatData.last - flatData.first);
                }
                return { month, units };
            });
            return res.status(200).json(result);
        }

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

const getDailyUsage = async (req, res) => {
    const { flatId } = req.params;
    if (!flatId) return res.status(400).json({ message: "Flat ID required" });
    try {
        const aggregatedIds = await getAggregatedFlatIds(flatId, req.user.id);

        if (aggregatedIds !== null) {
            if (aggregatedIds.length === 0) return res.status(200).json([]);

            const readings = await prisma.meterReading.findMany({
                where: { flatId: { in: aggregatedIds } },
                orderBy: { date: "asc" }
            });

            const dailyData = {};
            readings.forEach((r) => {
                const dateStr = new Date(r.date).toISOString().split('T')[0];
                if (!dailyData[dateStr]) dailyData[dateStr] = {};
                if (!dailyData[dateStr][r.flatId]) {
                    dailyData[dateStr][r.flatId] = { first: r.unit, last: r.unit };
                } else {
                    dailyData[dateStr][r.flatId].last = r.unit;
                }
            });

            const result = Object.keys(dailyData).map((date) => {
                let units = 0;
                for (const flatData of Object.values(dailyData[date])) {
                    units += (flatData.last - flatData.first);
                }
                return { date, units };
            });
            return res.status(200).json(result);
        }

        const readings = await prisma.meterReading.findMany({
            where: { flatId: Number(flatId) },
            orderBy: { date: "asc" }
        });
        const dailyData = {};
        readings.forEach((r) => {
            const dateStr = new Date(r.date).toISOString().split('T')[0];
            if (!dailyData[dateStr]) {
                dailyData[dateStr] = { first: r.unit, last: r.unit };
            } else {
                dailyData[dateStr].last = r.unit;
            }
        });
        const result = Object.keys(dailyData).map((date) => {
            return {
                date,
                units: dailyData[date].last - dailyData[date].first
            };
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching daily usage", error: error.message });
    }
};

const getTodayUsage = async (req, res) => {
    const { flatId } = req.params;
    if (!flatId) return res.status(400).json({ message: "Flat ID required" });
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        const aggregatedIds = await getAggregatedFlatIds(flatId, req.user.id);

        if (aggregatedIds !== null) {
            if (aggregatedIds.length === 0) return res.status(200).json(0);

            const readings = await prisma.meterReading.findMany({
                where: { flatId: { in: aggregatedIds } },
                orderBy: { date: "asc" }
            });

            let totalToday = 0;
            for (const id of aggregatedIds) {
                const flatReadings = readings.filter(r => r.flatId === id);
                const todayReadings = flatReadings.filter(r => new Date(r.date).toISOString().split('T')[0] === todayStr);
                
                if (todayReadings.length < 2) {
                    const allPast = flatReadings.filter(r => new Date(r.date).toISOString().split('T')[0] <= todayStr);
                    if (allPast.length >= 2 && new Date(allPast[allPast.length-1].date).toISOString().split('T')[0] === todayStr) {
                         totalToday += (allPast[allPast.length - 1].unit - allPast[allPast.length - 2].unit);
                    }
                } else {
                    const first = todayReadings[0].unit;
                    const last = todayReadings[todayReadings.length - 1].unit;
                    totalToday += (last - first);
                }
            }
            return res.status(200).json(totalToday);
        }

        const readings = await prisma.meterReading.findMany({
            where: { flatId: Number(flatId) },
            orderBy: { date: "asc" }
        });
        const todayReadings = readings.filter(r => new Date(r.date).toISOString().split('T')[0] === todayStr);
        if (todayReadings.length < 2) {
            // Check if there's a previous reading from before today to calculate difference
            const allPast = readings.filter(r => new Date(r.date).toISOString().split('T')[0] <= todayStr);
            if (allPast.length >= 2) {
                 const last = allPast[allPast.length - 1].unit;
                 const prev = allPast[allPast.length - 2].unit;
                 if (new Date(allPast[allPast.length-1].date).toISOString().split('T')[0] === todayStr) {
                     return res.status(200).json(last - prev);
                 }
            }
            return res.status(200).json(0);
        }
        const first = todayReadings[0].unit;
        const last = todayReadings[todayReadings.length - 1].unit;
        return res.status(200).json(last - first);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching today's usage", error: error.message });
    }
};

const getUsageBreakdown = async (req, res) => {
    const { flatId } = req.params;
    if (!flatId) return res.status(400).json({ message: "Flat ID required" });
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        const aggregatedIds = await getAggregatedFlatIds(flatId, req.user.id);

        if (aggregatedIds !== null) {
            if (aggregatedIds.length === 0) return res.status(200).json({ morning: 0, afternoon: 0, evening: 0, night: 0 });

            const readings = await prisma.meterReading.findMany({
                where: { flatId: { in: aggregatedIds } },
                orderBy: { createdAt: "asc" }
            });

            const breakdown = { morning: 0, afternoon: 0, evening: 0, night: 0 };
            
            for (const id of aggregatedIds) {
                const flatReadings = readings.filter(r => r.flatId === id);
                for (let i = 1; i < flatReadings.length; i++) {
                    const prev = flatReadings[i - 1];
                    const curr = flatReadings[i];
                    
                    if (new Date(curr.date).toISOString().split('T')[0] !== todayStr) continue;
                    
                    const diff = curr.unit - prev.unit;
                    if (diff < 0) continue;
                    
                    const hour = new Date(curr.createdAt).getHours();
                    if (hour >= 6 && hour < 12) breakdown.morning += diff;
                    else if (hour >= 12 && hour < 17) breakdown.afternoon += diff;
                    else if (hour >= 17 && hour < 21) breakdown.evening += diff;
                    else breakdown.night += diff;
                }
            }
            return res.status(200).json(breakdown);
        }

        const readings = await prisma.meterReading.findMany({
            where: { flatId: Number(flatId) },
            orderBy: { createdAt: "asc" }
        });
        
        const breakdown = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        
        for (let i = 1; i < readings.length; i++) {
            const prev = readings[i - 1];
            const curr = readings[i];
            
            if (new Date(curr.date).toISOString().split('T')[0] !== todayStr) continue;
            
            const diff = curr.unit - prev.unit;
            if (diff < 0) continue;
            
            const hour = new Date(curr.createdAt).getHours();
            if (hour >= 6 && hour < 12) breakdown.morning += diff;
            else if (hour >= 12 && hour < 17) breakdown.afternoon += diff;
            else if (hour >= 17 && hour < 21) breakdown.evening += diff;
            else breakdown.night += diff;
        }
        
        return res.status(200).json(breakdown);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching usage breakdown", error: error.message });
    }
};

module.exports = {
    getFlatSummary,
    getMonthlyUsage,
    getDailyUsage,
    getTodayUsage,
    getUsageBreakdown
};