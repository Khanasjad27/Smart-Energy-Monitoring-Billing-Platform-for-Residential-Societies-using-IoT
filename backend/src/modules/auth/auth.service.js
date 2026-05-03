const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs')


const registerUser = async (req, res) => {
    const { email, firstName, lastName, password, role } = req.body;
    if (!email || !firstName || !lastName || !password || !role) {
        return res.status(400).json({ message: "All Fields are required" });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email, firstName, lastName, password: hashedPassword, role
            }
        });
        // jwt.sign => used for creating a new token. 3 cheeze leta hai => 1. Data jo token me store karna hai (Payload), 2. Secret key, 3. kab expire hoga (ya optional hota hai)
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(201).json({
            message: "User registered successfully",
            token
        });

    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All Fields are required" });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            // agar password valid hai to user ko authenticate karna hai aur token generate karna hai
            if (isPasswordValid) {
                const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
                return res.status(200).json({ token });
            }
        }
        return res.status(401).json({ message: "Invalid Credentials , Please try again or Register if you don't have an account" });
    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
}

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { society: { include: { builder: true } } }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Remove password before sending
        delete user.password;
        
        // Add organization name based on role
        if (user.role === 'BUILDER_ADMIN' && user.society?.builder) {
            user.organizationName = user.society.builder.name;
        } else if (user.role === 'SOCIETY_ADMIN' && user.society) {
            user.organizationName = user.society.name;
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

const updateMe = async (req, res) => {
    const { firstName, lastName } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName }
        });
        delete updatedUser.password;
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateMe
};