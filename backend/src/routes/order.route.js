import express from "express";
import Order from "../models/order.model.js";  

const router = express.Router();

// POST /api/orders/create
router.post("/create", async (req, res) => {
  try {
    const { userEmail, shipping, items, total, paymentMethod } = req.body;

    // Basic validation
    if (!userEmail || !shipping || !items || !total || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const address = `${shipping.houseNo}, ${shipping.street}, ${shipping.city}, ${shipping.state}, ${shipping.country} - ${shipping.pincode}`;

    const newOrder = new Order({
      userEmail,
      shipping: {
        fullName: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone,
        address,
        country: shipping.country,
        state: shipping.state,
        city: shipping.city,
        pincode: shipping.pincode,
      },
      items: items.map(item => ({
        productId: item.id || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null,
      })),
      total,
      paymentMethod,
      status: "Confirmed",
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// (Optional) GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// (Optional) GET orders by user email
router.get("/user/:email", async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

export default router;