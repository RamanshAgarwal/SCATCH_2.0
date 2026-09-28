const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const productModel = require("../models/product-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

// Owner Login Page
router.get("/login", async function (req, res) {
    let owners = await ownerModel.find();
    res.render("owner-login", { ownerExists: owners.length > 0 });
});

// Create Owner POST
router.post("/create", async function (req, res) {
    try {
        let owners = await ownerModel.find();

        if (owners.length > 0) {
            req.flash("error", "Owner already exists. Only one owner account is permitted.");
            return res.redirect("/owners/login");
        }

        let { fullname, email, password, gstin } = req.body;

        if (!fullname || !email || !password) {
            req.flash("error", "All fields are required");
            return res.redirect("/owners/login");
        }

        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);

        let createdOwner = await ownerModel.create({
            fullname,
            email,
            password: hash,
            gstin: gstin || "GSTIN123456"
        });

        let token = jwt.sign(
            { email: createdOwner.email, id: createdOwner._id },
            keys.JWT_KEY
        );

        res.cookie("ownerToken", token);
        req.flash("success", "Owner account created successfully! Welcome Admin.");
        res.redirect("/owners/admin");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/owners/login");
    }
});

// Owner Login POST
router.post("/login", async function (req, res) {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            req.flash("error", "Email and Password are required");
            return res.redirect("/owners/login");
        }

        let owner = await ownerModel.findOne({ email });

        if (!owner) {
            req.flash("error", "Invalid Email or Password");
            return res.redirect("/owners/login");
        }

        let result = await bcrypt.compare(password, owner.password);

        if (!result) {
            req.flash("error", "Invalid Email or Password");
            return res.redirect("/owners/login");
        }

        let token = jwt.sign(
            { email: owner.email, id: owner._id },
            keys.JWT_KEY
        );

        res.cookie("ownerToken", token);
        req.flash("success", "Welcome back, Admin!");
        res.redirect("/owners/admin");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/owners/login");
    }
});

// Admin Dashboard Page
router.get("/admin", isOwnerLoggedIn, async function (req, res) {
    let products = await productModel.find();
    let success = req.flash("success");
    res.render("admin", { products, success });
});

// Logout
router.get("/logout", function (req, res) {
    res.clearCookie("ownerToken");
    req.flash("success", "Owner logged out successfully");
    res.redirect("/owners/login");
});

module.exports = router;