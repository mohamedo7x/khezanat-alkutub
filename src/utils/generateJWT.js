const {sign} = require("jsonwebtoken");

const generateJWT = async (payload) => await sign(
    payload,
    process.env.JWT_SECRET_KEY,
    {expiresIn: process.env.JWT_EXPIRE_TIME}
);


module.exports = generateJWT