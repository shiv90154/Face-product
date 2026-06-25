import express from "express";
const router = express.Router();
import { sendOTP, generateOTP } from "../utils/sendemail.js";

// Temporary store – replace with Redis/DB in production
const otpStore = new Map();

// Helper to clean expired OTPs periodically (optional)
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(email);
  }
}, 60000); // run every minute

// Endpoint to request an OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate a 6-digit OTP
    const otp = generateOTP();
    const expiryMinutes = 5;
    const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

    // Store it (overwrites any previous OTP for this email)
    otpStore.set(email, { otp, expiresAt });

    // Send the email
    await sendOTP(email, otp, expiryMinutes);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Endpoint to verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ error: "No OTP request found for this email" });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid – delete it so it cannot be reused
    otpStore.delete(email);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});
export default router; 