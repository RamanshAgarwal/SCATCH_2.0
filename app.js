require("dotenv").config();

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const path = require("path");
const jwt = require("jsonwebtoken");

const db = require("./config/mongoose-connection");
const keys = require("./config/keys");
const userModel = require("./models/user-model");
const ownerModel = require("./models/owner-model");

const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const indexRouter = require("./routes/index");

const expressSession = require("express-session");
const flash = require("connect-flash");

// Body Parser & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET || "scatch_session_secret_key_123456",
    })
);

// View Engine
app.set("view engine", "ejs");

// Flash Messages
app.use(flash());

// Global template variables middleware
app.use(async function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.user = null;
    res.locals.owner = null;

    if (req.cookies.token) {
        try {
            let decoded = jwt.verify(req.cookies.token, keys.JWT_KEY);
            let user = await userModel.findOne({ email: decoded.email }).select("-password");
            if (user) {
                res.locals.user = user;
                req.user = user;
            }
        } catch (e) {
            // invalid token
        }
    }

    if (req.cookies.ownerToken) {
        try {
            let decoded = jwt.verify(req.cookies.ownerToken, keys.JWT_KEY);
            let owner = await ownerModel.findOne({ email: decoded.email }).select("-password");
            if (owner) {
                res.locals.owner = owner;
                req.owner = owner;
            }
        } catch (e) {
            // invalid token
        }
    }

    next();
});

// Routes
app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/products", productsRouter);
app.use("/users", usersRouter);

// 404 Handler
app.use(function (req, res) {
    res.status(404).render("index", {
        error: ["Page not found"],
        success: []
    });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});