const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (user_id, role) => {
    const payload = {
        user: user_id,
        role: role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1hr" });
};
