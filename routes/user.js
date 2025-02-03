const express = require("express");
const router = express.Router();
const User = require("../models/User");

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
    const { productId, colorId, quantity } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the product already exists in the cart
        const existingItem = user.cart.find(
            (item) => item.productId.toString() === productId && item.colorId.toString() === colorId
        );

        if (existingItem) {
            // If the product already exists, increase the quantity
            existingItem.quantity += quantity;
        } else {
            // Otherwise, add a new product to the cart
            user.cart.push({ productId, colorId, quantity });
        }

        // Save the updated user
        await user.save();

        res.json(user.cart);
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: "Server error" });
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

        user.cart.id(cartItemId).remove(); // Remove the item with the given cartItemId
        await user.save(); // Save the updated user (cart is modified)

        res.json(user.cart); // Send back the updated cart
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
