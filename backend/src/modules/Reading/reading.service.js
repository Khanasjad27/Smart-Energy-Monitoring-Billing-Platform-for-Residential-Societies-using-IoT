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

const createMeterReading = async (req, res) => {
    const { flatId, unit, date } = req.body;

    if (!flatId || !unit || unit <= 0) {
        return res.status(400).json({
            message: "Valid flatId and unit (>0) required"
        });
    }

    try {
        const isflatExist = await prisma.flat.findUnique({ where: { id: Number(flatId) } });
        if (!isflatExist) {
            return res.status(400).json({
                message: `Given flatId not Exists`
            });
        }

        const readingData = { unit, flatId: Number(flatId) };
        if (date) {
            readingData.date = new Date(date);
        }

        const readingEntry = await prisma.meterReading.create({
            data: readingData
        });

        return res.status(201).json({
            message: `Meter Reading Unit Entered`,
            readingEntry
        });

    } catch (error) {
        return res.status(500).json({
            message: `Server Error: ${error.message}`
        });
    }
}

const getMeterReadingsByFlat = async (req, res) => {
    const { flatId } = req.params;
    if (!flatId) {
        return res.status(400).json({
            message: `FlatId need to Entered`
        });
    }
    try {
        const aggregatedIds = await getAggregatedFlatIds(flatId, req.user.id);
        
        if (aggregatedIds !== null) {
            if (aggregatedIds.length === 0) {
                return res.status(200).json({
                    message: `Here is aggregated reading`,
                    allReadings: []
                });
            }

            const allReadings = await prisma.meterReading.findMany({ 
                where: { flatId: { in: aggregatedIds } }, 
                orderBy: { createdAt: "desc" },
                take: 100 // limit to avoid massive payloads
            });
            return res.status(200).json({
                message: `Here is aggregated reading`,
                allReadings
            });
        }

        const flat = await prisma.flat.findUnique({ where: { id: Number(flatId) } });
        if (!flat) return res.status(400).json({ message: "Flat not found" });

        const allReadings = await prisma.meterReading.findMany({ where: { flatId: Number(flatId) }, orderBy: { createdAt: "desc" } });
        return res.status(200).json({
            message: `Here is all reading of Flat Id: ${flatId}`,
            allReadings
        });
    } catch (error) {
        return res.status(500).json({
            message: `Server Error: ${error.message}`
        });
    }

}

module.exports = {
    getMeterReadingsByFlat,
    createMeterReading
}