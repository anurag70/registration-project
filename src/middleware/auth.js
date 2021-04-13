const jwt = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async(req, res, next) => {
    try {
        //getting the token
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyUser);
    } catch (e) {
        res.status(401).send(e);
    }
}
module.exports = auth;