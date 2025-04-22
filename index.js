const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Stripe = require("stripe");
const connectDB = require("./db/dbserver");
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user");

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3001;
const url = process.env.CONNECTION_URL.replace("<db_password>", process.env.PASSWORD);

app.get("/", (req, res) => {
    res.send("Welcome to the backend API");
});


app.use(cors({
    origin: ['http://localhost:3000', 'https://impact-rho.vercel.app'],
    credentials: true,
}));

// Create a Payment Intent
app.post("/api/checkout", async (req, res) => {
    try {
        const { items } = req.body;

        if (!items?.length) {
            return res.status(400).json({ error: "No items provided" });
        }

        console.log('Received items:', items); // Add logging

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: items,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
        });

        console.log('Session created:', session.id); // Add logging
        return res.status(200).json({ id: session.id });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        return res.status(500).json({
            error: error.message || "Failed to create checkout session"
        });
    }
});




connectDB(url);

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
