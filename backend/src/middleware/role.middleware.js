
const roles = (...requiredRoles) => {  // Middleware function to check if the user has one of the required roles

    // ...requiredRoles => ya kya karega ki 1 se zada role user enter karsakta hai, question aata hai ki ek se jaada role li kya zarurat hai? => if society me kuch change karna hai , therefor useke liya hame SOCIETY_ADMIN + BUILDER_ADMIN dono role chahiye, isliye multiple role lene ki zarurat hai
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userRole = req.user.role; // Assuming the user's role is stored in req.user.role

        if (requiredRoles.includes(userRole)) { // requiredRoles.includes(userRole) => this thing is for checking ki jo role user ke pass hai wo requiredRoles me se kisi ek ke barabar hai ya nahi
            next(); // user ke pass required role hai, next middleware pe jao
        } else {
            return res.status(403).json({ message: "Forbidden: You don't have the required role" });
        }
    }
}


module.exports = roles;