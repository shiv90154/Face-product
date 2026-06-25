import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/user.routes.js";
import otpRouter from "./routes/otp.routes.js";  
import orderRouter from "./routes/order.route.js";
import paymentRouter from "./routes/payment.routes.js";
// ─── ES module workaround for __dirname ───
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Import all routes from index.js ───
import { authRouter, productRouter, uploadRouter, categoryRouter } from "./routes/index.js";

// ─── Initialize app ───
const app = express();

// ─── Middleware ───
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/users", userRouter);
// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Routes ───
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/otp", otpRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payement",paymentRouter);
app.use("/api", paymentRouter);
// ─── Health check ───
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// ─── 404 handler ───
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ───
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// ─── Export the configured app ───
export default app;