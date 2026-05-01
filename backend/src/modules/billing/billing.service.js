const prisma = require('../../config/prisma');


const generateBillByFlat = async (req, res) => {
    const { flatId } = req.params;

    if (!flatId) {
        return res.status(400).json({ message: `Flat ID is required` });
    }

    try {
        const isFlatExist = await prisma.flat.findUnique({ where: { id: Number(flatId) } });
        if (!isFlatExist) {
            return res.status(404).json({ message: `Flat with ID ${flatId} not found` });
        }

        const readings = await prisma.meterReading.findMany({ where: { flatId: Number(flatId) }, orderBy: { createdAt: "desc" }, take: 2 });


        if (readings.length < 2) {
            return res.status(400).json({
                message: `Not enough data to generate bill`
            });
        }

        let latest = readings[0];
        let previous = readings[1];

        const unitsConsumed = latest.unit - previous.unit;

        if (unitsConsumed < 0) {
            return res.status(400).json({
                message: `Invalid data`
            });
        }

        const rate = 5;
        const totalAmount = unitsConsumed * rate;

        return res.status(200).json({
            flatId : Number(flatId), unitsConsumed, rate, totalAmount
        })
    } catch (error) {
        return res.status(500).json({ message: `Error generating bill: ${error.message}` });
    }
}

module.exports = {
    generateBillByFlat
}