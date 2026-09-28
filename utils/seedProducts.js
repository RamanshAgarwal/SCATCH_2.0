const productModel = require("../models/product-model");
const fs = require("fs");
const path = require("path");

const defaultProducts = [
    {
        name: "Scatch Noir Leather Tote",
        price: 2400,
        discount: 400,
        bgcolor: "#e2e8f0",
        panelcolor: "#1e293b",
        textcolor: "#ffffff",
        imagePath: "public/designs/1bag.png"
    },
    {
        name: "Royal Amber Backpack",
        price: 3200,
        discount: 500,
        bgcolor: "#fef3c7",
        panelcolor: "#78350f",
        textcolor: "#ffffff",
        imagePath: "public/designs/2bag.png"
    },
    {
        name: "Prism Emerald Duffle",
        price: 4500,
        discount: 750,
        bgcolor: "#d1fae5",
        panelcolor: "#064e3b",
        textcolor: "#ffffff",
        imagePath: "public/designs/3bag 1.png"
    },
    {
        name: "Urban Cobalt Crossbody",
        price: 1800,
        discount: 300,
        bgcolor: "#dbeafe",
        panelcolor: "#1e3a8a",
        textcolor: "#ffffff",
        imagePath: "public/designs/4bag.png"
    },
    {
        name: "Velvet Rose Handbag",
        price: 2900,
        discount: 450,
        bgcolor: "#fce7f3",
        panelcolor: "#831843",
        textcolor: "#ffffff",
        imagePath: "public/designs/5bag.png"
    },
    {
        name: "Classic Tan Briefcase",
        price: 3800,
        discount: 600,
        bgcolor: "#ffedd5",
        panelcolor: "#7c2d12",
        textcolor: "#ffffff",
        imagePath: "public/designs/6bag.png"
    },
    {
        name: "Monogram Luxe Clutch",
        price: 2100,
        discount: 350,
        bgcolor: "#f3e8ff",
        panelcolor: "#581c87",
        textcolor: "#ffffff",
        imagePath: "public/designs/7bag.png"
    },
    {
        name: "Artisan Leather Messenger",
        price: 3500,
        discount: 500,
        bgcolor: "#f1f5f9",
        panelcolor: "#0f172a",
        textcolor: "#ffffff",
        imagePath: "public/designs/image 80.png"
    },
    {
        name: "Heritage Brown Travel Duffle",
        price: 4900,
        discount: 800,
        bgcolor: "#fef3c7",
        panelcolor: "#451a03",
        textcolor: "#ffffff",
        imagePath: "public/designs/8bag.png"
    },
    {
        name: "Midnight Stealth Backpack",
        price: 3900,
        discount: 600,
        bgcolor: "#e2e8f0",
        panelcolor: "#18181b",
        textcolor: "#ffffff",
        imagePath: "public/designs/9bag.png"
    },
    {
        name: "Emerald Gold Evening Purse",
        price: 4200,
        discount: 700,
        bgcolor: "#d1fae5",
        panelcolor: "#022c22",
        textcolor: "#ffffff",
        imagePath: "public/designs/10bag.png"
    }
];

async function seedProductsIfEmpty() {
    try {
        const count = await productModel.countDocuments();
        // If products exist but don't have images, re-seed to ensure all have images
        const missingImageCount = await productModel.countDocuments({ image: null });

        if (count === 0 || missingImageCount > 0) {
            console.log("Seeding/updating luxury bag products from public/designs...");
            if (missingImageCount > 0) {
                await productModel.deleteMany({});
            }
            for (const prod of defaultProducts) {
                const fullPath = path.join(__dirname, "..", prod.imagePath);
                let imageBuffer = null;
                if (fs.existsSync(fullPath)) {
                    imageBuffer = fs.readFileSync(fullPath);
                }
                await productModel.create({
                    name: prod.name,
                    price: prod.price,
                    discount: prod.discount,
                    bgcolor: prod.bgcolor,
                    panelcolor: prod.panelcolor,
                    textcolor: prod.textcolor,
                    image: imageBuffer
                });
            }
            console.log("Luxury bag products seeded successfully.");
        }
    } catch (err) {
        console.error("Error seeding products:", err);
    }
}

module.exports = seedProductsIfEmpty;

