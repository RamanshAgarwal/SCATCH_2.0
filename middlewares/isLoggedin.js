const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const keys = require("../config/keys");

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        let decoded = jwt.verify(req.cookies.token, keys.JWT_KEY);

        let user = await userModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!user) {
            res.clearCookie("token");
            req.flash("error", "User not found. Please login again.");
            return res.redirect("/");
        }

        req.user = user;
        res.locals.user = user;
        next();

    } catch (err) {
        res.clearCookie("token");
        req.flash("error", "Something went wrong. Please login again.");
        res.redirect("/");
    }
};