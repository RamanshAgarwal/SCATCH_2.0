const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
    try {
        let { email, password, fullname } = req.body;

        if (!email || !password || !fullname) {
            req.flash("error", "All fields are required");
            return res.redirect("/");
        }

        if (password.length < 4) {
            req.flash("error", "Password must be at least 4 characters long");
            return res.redirect("/");
        }

        let user = await userModel.findOne({ email: email });

        if (user) {
            req.flash("error", "You already have an account. Please Login!");
            return res.redirect("/");
        }

        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);

        let createdUser = await userModel.create({
            email,
            password: hash,
            fullname,
        });

        let token = generateToken(createdUser);

        res.cookie("token", token);
        req.flash("success", "Account created successfully! Welcome to Scatch.");
        res.redirect("/shop");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/");
    }
};

module.exports.loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            req.flash("error", "Email and Password are required");
            return res.redirect("/");
        }

        let user = await userModel.findOne({ email: email });

        if (!user) {
            req.flash("error", "Email or Password Incorrect");
            return res.redirect("/");
        }

        let result = await bcrypt.compare(password, user.password);

        if (!result) {
            req.flash("error", "Email or Password Incorrect");
            return res.redirect("/");
        }

        let token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", `Welcome back, ${user.fullname}!`);
        return res.redirect("/shop");

    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("/");
    }
};

module.exports.logout = function (req, res) {
    res.clearCookie("token");
    req.flash("success", "Logged out successfully");
    res.redirect("/");
};