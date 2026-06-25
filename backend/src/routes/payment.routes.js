import express from "express";

const router = express.Router();

// Dummy payment endpoint (always succeeds for testing)
router.post("/process-payment", async (req, res) => {
  try {
    const { token, total } = req.body;
    console.log("Payment token:", token);
    console.log("Total amount:", total);

    // In production, you'd verify the token and charge the card.
    // For now, we simulate success.
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ success: false, error: "Payment failed" });
  }
});

export default router;