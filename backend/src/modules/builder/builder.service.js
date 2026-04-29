const prisma = require('../../config/prisma');


const getAllBuilders = async (req, res) => {
    try {
        const builders = await prisma.builder.findMany();
        return res.status(200).json(builders);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
}

const createBuilder = async (req, res) => {
    const { name, location } = req.body;
    if (!name || !location) {
        return res.status(400).json({ message: "Name and location are required" });
    }

    try {
        const isBuilderExist = await prisma.builder.findFirst({ where: { name } });

        if (isBuilderExist) {
            return res.status(400).json({ message: "Builder with this name already exists" });
        }

        const newBuilder = await prisma.builder.create({
            data: {
                name, location
            }
        });

        return res.status(201).json(newBuilder);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
}

const updateBuilder = async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;
    const builderId = Number(id); // coz prisma me id number type ka hai aur req.params se string aata hai to usko number me convert karna padega

    if (!name || !location) {
        return res.status(400).json({ message: "Name and location are required" });
    }

    try {
        const updatedBuilder = await prisma.builder.update({
            where: { id: builderId },
            data: { name, location }
        });

        return res.status(200).json(updatedBuilder);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
}


const deleteBuilder = async (req, res) => {
    const { id } = req.params;
    const builderId = Number(id);

    try {
        await prisma.builder.delete({ where: { id: builderId } });
        return res.status(200).json({ message: "Builder deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
}

module.exports = {
    getAllBuilders,
    createBuilder,
    updateBuilder,
    deleteBuilder
};
