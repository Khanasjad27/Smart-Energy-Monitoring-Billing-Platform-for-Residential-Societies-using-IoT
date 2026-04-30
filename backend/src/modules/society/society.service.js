const prisma = require('../../config/prisma');

const getAllSocieties = async (req, res) => {
    try {
        const allSocieties = await prisma.society.findMany();
        return res.status(200).json({ allSocieties })
    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}

const createSociety = async (req, res) => {
    const { name, address, builderId } = req.body;
    if (!name || !address || !builderId) {
        return res.status(400).json({ message: `All fields are required` });
    }

    try {
        const isSocietyExists = await prisma.society.findFirst({ where: { name } });
        const isBuilderExists = await prisma.builder.findUnique({ where: { id: builderId } });

        if (!isBuilderExists) {
            return res.status(400).json({ message: `Builder not exists with this id` });
        }
        if (isSocietyExists) {
            return res.status(400).json({ message: `Society already exists with this name, try different name` });
        }

        const newSociety = await prisma.society.create({
            data: {
                name, address, builderId
            }
        });

        return res.status(201).json({ message: 'Society Created ', newSociety });

    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}

const updateSociety = async (req, res) => {
    const { name, address } = req.body;
    const { id } = req.params;
    const societyId = Number(id);

    if (!name || !address) {
        return res.status(400).json({ message: `All fields are required` });
    }

    try {
        const isSocietyExists = await prisma.society.findUnique({ where: { id: societyId } });

        if (!isSocietyExists) {
            return res.status(400).json({ message: `Society not Exists` });
        }

        const updateSociety = await prisma.society.update({
            where: { id: societyId },
            data: { name, address }
        });

        return res.status(200).json({
            message: `Society Updated successfully`,
            updateSociety
        });
    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}

const deleteSociety = async (req, res) => {
    const { id } = req.params;
    const societyId = Number(id);

    try {
        await prisma.society.delete({ where: { id: societyId } });
        return res.status(200).json({
            message: `Society Deleted successfully`
        })
    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}