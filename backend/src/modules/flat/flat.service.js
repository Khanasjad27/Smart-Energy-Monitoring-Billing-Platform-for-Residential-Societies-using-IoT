const prisma = require('../../config/prisma');

const getAllFlats = async (req, res) => {
    try {
        const flats = await prisma.flat.findMany();
        return res.status(200).json(flats);
    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}

const createFlat = async (req, res) => {
    const { flatNumber, floor, societyId, ownerId } = req.body;
    if (!flatNumber || !floor || !societyId || !ownerId) {
        return res.status(400).json({
            message: `All credientials are Required`
        });
    }

    try {
        const isFlat = await prisma.flat.findFirst({ where: { flatNumber, floor, societyId } });
        const isSocietyExist = await prisma.society.findUnique({ where: { id: societyId } });
        const isOwnerExist = await prisma.user.findUnique({ where: { id: ownerId } });

        if (!isSocietyExist) {
            return res.status(400).json({
                message: `Society not exists with this id`
            });
        }
        if (!isOwnerExist) {
            return res.status(400).json({
                message: `Owner not exists with this id`
            });
        }
        if (isFlat) {
            return res.status(400).json({
                message: `Account with Flat Number with given floor is already Created `
            });
        }

        const flat = await prisma.flat.create({
            data: {
                flatNumber, floor, societyId, ownerId
            }
        });

        return res.status(201).json({
            message: `Account Created Succesfully`, flat
        })
    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}

const updateFlat = async (req, res) => {
    const { flatNumber, floor, societyId, ownerId } = req.body;
    const { id } = req.params;
    const flatId = Number(id);

    try {
        const isFlatExist = await prisma.flat.findUnique({ where: { id: flatId } });

        if (!isFlatExist) {
            return res.status(404).json({
                message: `Flat not exists with this id`
            });
        }

        const data = {}; // if there is changes then only update otherwise keep it same

        if (flatNumber) data.flatNumber = flatNumber;
        if (floor) data.floor = floor;

        if (societyId) data.societyId = societyId;
        if (ownerId) data.ownerId = ownerId;

        // if there is no changes then also it will update but it will keep the same data
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: "No fields provided to update" });
        }
        if (data.societyId) {
            const society = await prisma.society.findUnique({ where: { id: data.societyId } });
            if (!society) {
                return res.status(404).json({ message: "Society not found" });
            }
        }

        if (data.ownerId) {
            const user = await prisma.user.findUnique({ where: { id: data.ownerId } });
            if (!user) {
                return res.status(404).json({ message: "Owner not found" });
            }
        }
        const updateFlat = await prisma.flat.update({
            where: { id: flatId },
            data: data

        });
        return res.status(200).json({
            message: `Flat updated successfully`,
            flat: updateFlat
        });

    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}

const deleteFlat = async (req, res) => {
    const { id } = req.params;
    const flatId = Number(id);
    try {
        const isFlatExist = await prisma.flat.findUnique({ where: { id: flatId } });

        if (!isFlatExist) {
            return res.status(400).json({
                message: `Flat not exists with this id`
            });
        }
        await prisma.flat.delete({ where: { id: flatId } });
        return res.status(200).json({
            message: `Flat deleted successfully`
        });
    } catch (error) {
        return res.status(500).json({
            message: `Server error : ${error.message}`
        });
    }
}

const getFlatsByUser = async (req, res) => {
    try {
        const flats = await prisma.flat.findMany({ where: { ownerId: req.user.id } });
        return res.status(200).json(flats);
    } catch (error) {
        return res.status(500).json({ message: `Server error : ${error.message}` });
    }
};

const getFlatsBySociety = async (req, res) => {
    try {
        // Fetch the user from DB to get their societyId since it's not in the JWT token payload
        const adminUser = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!adminUser || !adminUser.societyId) {
             return res.status(400).json({ message: "No society associated with this admin" });
        }
        const flats = await prisma.flat.findMany({ where: { societyId: adminUser.societyId } });
        return res.status(200).json(flats);
    } catch (error) {
        return res.status(500).json({ message: `Server error : ${error.message}` });
    }
};

module.exports = {
    getAllFlats,
    getFlatsByUser,
    getFlatsBySociety,
    createFlat,
    updateFlat,
    deleteFlat
}