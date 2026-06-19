import express from "express";
import { getUserCount,getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();
router.get("/count", getUserCount);
router.get("/", getAllUsers);  
export default router;