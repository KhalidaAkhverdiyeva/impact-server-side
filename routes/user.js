const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");


// GET user by ID (unchanged)
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add product to cart (or update if already in cart)
router.post("/:userId/cart", async (req, res) => {
    const { userId } = req.params;
    const { items } = req.body; // Expect an array of items

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            message: "Items array is required"
        });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Process each item in the array
        for (const item of items) {
            const { productId, colorId, quantity = 1 } = item;

            if (!productId || !colorId) {
                return res.status(400).json({
                    message: "ProductId and colorId are required for each item"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(productId) ||
                !mongoose.Types.ObjectId.isValid(colorId)) {
                return res.status(400).json({
                    message: `Invalid productId or colorId format for item: ${productId}`
                });
            }

            // Check if the product already exists
            const existingItem = user.cart.find(
                (cartItem) =>
                    cartItem.productId.toString() === productId &&
                    cartItem.colorId.toString() === colorId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                user.cart.push({
                    productId,
                    colorId,
                    quantity: Math.max(1, quantity)
                });
            }
        }

        const savedUser = await user.save();
        res.json(savedUser.cart);
    } catch (error) {
        console.error("Error adding products to cart:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// Get user's cart (all items in the cart)
router.get("/:userId/cart", async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by ID and return the cart
        const user = await User.findById(userId).select("cart");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.cart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update quantity of a specific cart item
router.put("/:userId/cart/:cartItemId", async (req, res) => {
    const { userId, cartItemId } = req.params;
    const { quantity } = req.body;

    try {

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const cartItem = user.cart.id(cartItemId);

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        cartItem.quantity = quantity;
        await user.save();

        res.json(cartItem);
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Remove item from cart
router.delete("/:userId/cart/:cartItemId", async (req, res) => {
    const { userId, cartItemId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.cart = user.cart.filter(item => item._id.toString() !== cartItemId);

        await user.save(); // Save the updated user

        res.json({ message: "Item removed from cart", cart: user.cart });
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
