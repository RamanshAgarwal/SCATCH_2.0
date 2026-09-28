const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

// All Products (Admin view)
router.get("/", isOwnerLoggedIn, async function (req, res) {
    try {
        let products = await productModel.find();
        res.render("admin", { products });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/owners/admin");
    }
});

// Create New Product Page
router.get("/create", isOwnerLoggedIn, function (req, res) {
    let success = req.flash("success");
    res.render("createproducts", { success });
});

// Create Product POST
router.post("/create", isOwnerLoggedIn, upload.single("image"), async function (req, res) {
    try {
        let {
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor
        } = req.body;

        if (!req.file) {
            req.flash("error", "Product image is required");
            return res.redirect("/products/create");
        }

        let createdProduct = await productModel.create({
            image: req.file.buffer,
            name: name,
            price: Number(price),
            discount: Number(discount) || 0,
            bgcolor: bgcolor || "#f3f4f6",
            panelcolor: panelcolor || "#27272a",
            textcolor: textcolor || "#ffffff"
        });

        req.flash("success", "Product created successfully!");
        res.redirect("/owners/admin");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/products/create");
    }
});

// Delete Single Product
router.get("/delete/:id", isOwnerLoggedIn, async function (req, res) {
    try {
        await productModel.findOneAndDelete({ _id: req.params.id });
        req.flash("success", "Product deleted successfully");
        res.redirect("/owners/admin");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/owners/admin");
    }
});

// Delete All Products
router.get("/deleteall", isOwnerLoggedIn, async function (req, res) {
    try {
        await productModel.deleteMany({});
        req.flash("success", "All products have been deleted");
        res.redirect("/owners/admin");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/owners/admin");
    }
});

module.exports = router;