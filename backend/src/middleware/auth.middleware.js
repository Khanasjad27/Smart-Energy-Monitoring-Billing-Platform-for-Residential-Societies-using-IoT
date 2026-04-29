const jwt = require('jsonwebtoken');

// Middleware to authenticate user using JWT
const authUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Authentication failed" });
    }
}

module.exports = authUser;