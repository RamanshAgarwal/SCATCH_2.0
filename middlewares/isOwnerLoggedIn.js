const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");
const keys = require("../config/keys");

module.exports = async function (req, res, next) {
    if (!req.cookies.ownerToken) {
        req.flash("error", "Owner login required");
        return res.redirect("/owners/login");
    }

    try {
        let decoded = jwt.verify(req.cookies.ownerToken, keys.JWT_KEY);
        let owner = await ownerModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!owner) {
            res.clearCookie("ownerToken");
            req.flash("error", "Owner account not found");
            return res.redirect("/owners/login");
        }

        req.owner = owner;
        res.locals.owner = owner;
        next();
    } catch (err) {
        res.clearCookie("ownerToken");
        req.flash("error", "Invalid or expired owner session");
        return res.redirect("/owners/login");
    }
};
