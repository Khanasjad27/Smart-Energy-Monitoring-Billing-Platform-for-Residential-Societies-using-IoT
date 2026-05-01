const prisma = require('../../config/prisma');

const createMeterReading = async (req, res) => {
    const { flatId, unit } = req.body;

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

        const readingEntry = await prisma.meterReading.create({
            data: { unit, flatId: Number(flatId) }
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