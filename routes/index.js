const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const seedProductsIfEmpty = require("../utils/seedProducts");

// Landing Page (Login / Register)
router.get("/", function (req, res) {
    if (req.cookies.token) {
        return res.redirect("/shop");
    }
    let error = req.flash("error");
    let success = req.flash("success");
    res.render("index", { error, success });
});

// Shop Page
router.get("/shop", isLoggedIn, async function (req, res) {
    try {
        await seedProductsIfEmpty();

        let sortby = req.query.sortby || "newest";
        let filter = req.query.filter || "all";

        let query = {};
        if (filter === "discount") {
            query.discount = { $gt: 0 };
        }

        let sortOption = { _id: -1 };
        if (sortby === "price_asc") {
            sortOption = { price: 1 };
        } else if (sortby === "price_desc") {
            sortOption = { price: -1 };
        } else if (sortby === "discount") {
            sortOption = { discount: -1 };
        } else if (sortby === "newest") {
            sortOption = { _id: -1 };
        }

        let products = await productModel.find(query).sort(sortOption);
        let success = req.flash("success");
        let error = req.flash("error");

        res.render("shop", { products, sortby, filter, success, error });
    } catch (err) {
        req.flash("error", err.message);
        res.render("shop", { products: [], sortby: "newest", filter: "all", success: [], error: [err.message] });
    }
});

// Add to Cart
router.get("/addtocart/:id", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        user.cart.push(req.params.id);
        await user.save();

        req.flash("success", "Added to cart successfully!");
        res.redirect("/shop");
    } catch (err) {
        req.flash("error", "Failed to add product to cart");
        res.redirect("/shop");
    }
});

// Cart Page
router.get("/cart", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("cart");

        // Group cart items and calculate price breakdown
        let cartItems = user.cart || [];
        let totalMRP = 0;
        let totalDiscount = 0;

        cartItems.forEach(item => {
            if (item) {
                totalMRP += Number(item.price || 0);
                totalDiscount += Number(item.discount || 0);
            }
        });

        let platformFee = cartItems.length > 0 ? 20 : 0;
        let shippingFee = 0; // FREE
        let totalAmount = Math.max(0, (totalMRP - totalDiscount)) + platformFee;

        let bill = {
            totalMRP,
            totalDiscount,
            platformFee,
            shippingFee,
            totalAmount
        };

        let success = req.flash("success");
        let error = req.flash("error");

        res.render("cart", { user, cartItems, bill, success, error });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/shop");
    }
});

// Remove item from Cart
router.get("/cart/remove/:id", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        let itemIndex = user.cart.indexOf(req.params.id);
        if (itemIndex > -1) {
            user.cart.splice(itemIndex, 1);
            await user.save();
            req.flash("success", "Item removed from cart");
        }
        res.redirect("/cart");
    } catch (err) {
        req.flash("error", "Failed to remove item");
        res.redirect("/cart");
    }
});

// Clear Cart
router.get("/cart/clear", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        user.cart = [];
        await user.save();
        req.flash("success", "Cart cleared");
        res.redirect("/cart");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/cart");
    }
});

// Checkout / Place Order
router.post("/cart/checkout", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("cart");

        if (!user.cart || user.cart.length === 0) {
            req.flash("error", "Your cart is empty!");
            return res.redirect("/cart");
        }

        let totalMRP = 0;
        let totalDiscount = 0;
        user.cart.forEach(item => {
            if (item) {
                totalMRP += Number(item.price || 0);
                totalDiscount += Number(item.discount || 0);
            }
        });
        let totalAmount = Math.max(0, (totalMRP - totalDiscount)) + 20;

        let itemIds = user.cart.map(item => item._id);

        user.orders.push({
            items: itemIds,
            totalAmount: totalAmount,
            date: new Date()
        });

        user.cart = [];
        await user.save();

        req.flash("success", "Order placed successfully! Thank you for shopping with Scatch.");
        res.redirect("/orders");
    } catch (err) {
        req.flash("error", "Checkout failed: " + err.message);
        res.redirect("/cart");
    }
});

// Orders History Page
router.get("/orders", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("orders.items");
        let success = req.flash("success");
        let error = req.flash("error");
        res.render("orders", { user, orders: user.orders.reverse(), success, error });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/shop");
    }
});

// Logout
router.get("/logout", function (req, res) {
    res.clearCookie("token");
    req.flash("success", "Logged out successfully");
    res.redirect("/");
});

module.exports = router;