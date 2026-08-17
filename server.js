const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ------------------------------------
// SAMPLE PRODUCT DATABASE
// ------------------------------------

const products = [
    {
        id: 1,
        name: "Formal Shirt For Women",
        category: "Clothing",
        price: 799,
        image: "/images/shirt1.jpg",
        description: "Comfortable cotton shirt 👚."
    },
    {
        id: 2,
        name: "Stripped Shirt For Women",
        category: "Clothing",
        price: 1899,
        image: "/images/shirt2.jpg",
        description: "Premium Shirt for casual styling."
    },
    {
        id: 3,
        name: "Sneakers",
        category: "Footwear",
        price: 2499,
        image: "/images/shoes1.jpg",
        description: "Lightweight shoes designed for everyday comfort."
    },
    {
        id: 4,
        name: "Minimalist Watch",
        category: "Accessories",
        price: 1599,
        image: "/images/watch1.jpg",
        description: "Elegant minimalist watch for everyday use."
    },
    {
        id: 5,
        name: "Everyday HandBag",
        category: "Bags",
        price: 2499,
        image: "/images/bag1.jpg",
        description: "Compact and stylish everyday handbag."
    },
    { id: 6, 
        name: "Minimal Jewelry", 
        price: 750, 
        image: "/images/minimal jewelry.jpg", 
        description: "Simple and elegant for everyday use."}
];

// ------------------------------------
// HOME PAGE
// ------------------------------------

app.get("/", (req, res) => {

    res.render("index", {
        products: products
    });

});

// ------------------------------------
// PRODUCT DETAILS
// ------------------------------------

app.get("/product/:id", (req, res) => {

    const product = products.find(
        p => p.id == req.params.id
    );

    if (!product) {
        return res.status(404).send("Product not found");
    }

    res.render("product", {
        product: product
    });

});

// ------------------------------------
// CART PAGE
// ------------------------------------

app.get("/cart", (req, res) => {

    res.render("cart", {
        products: products
    });

});

// ------------------------------------
// CHECKOUT PAGE
// ------------------------------------

app.get("/checkout", (req, res) => {

    const productId = req.query.productId;

    const product = products.find(
        p => p.id == productId
    );

    if (!product) {
        return res.redirect("/");
    }

    res.render("checkout", {
        product: product,
        razorpayKey: process.env.RAZORPAY_KEY_ID
    });

});

// ------------------------------------
// CREATE RAZORPAY ORDER
// ------------------------------------

app.post("/create-order", async (req, res) => {

    try {

        const { productId } = req.body;

        const product = products.find(
            p => p.id == productId
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const options = {

            amount: product.price * 100,

            currency: "INR",

            receipt: "stylecart_" + Date.now(),

            notes: {
                product_id: product.id,
                product_name: product.name
            }

        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: order,
            product: product
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order"
        });

    }

});

// ------------------------------------
// VERIFY PAYMENT
// ------------------------------------

app.post("/verify-payment", (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");

        if (generatedSignature === razorpay_signature) {

            res.json({
                success: true,
                message: "Payment verified successfully"
            });

        } else {

            res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });

        }

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Verification error"
        });

    }

});

// ------------------------------------
// SUCCESS PAGE
// ------------------------------------

app.get("/success", (req, res) => {

    res.render("success");

});

// ------------------------------------
// SERVER
// ------------------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `StyleCart server running at http://localhost:${PORT}`
    );

});