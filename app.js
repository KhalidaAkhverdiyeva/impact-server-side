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
app.post("/api/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: { name: item.name },
                    unit_amount: item.price * 100, // Convert to cents
                },
                quantity: item.quantity,
            })),
            ssuccess_url: successUrl,
            cancel_url: cancelUrl,
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



connectDB(url);

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
