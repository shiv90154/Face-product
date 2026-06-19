import express from "express";

import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/get-me", getMe);

authRouter.get("/refresh-token", refreshToken);

authRouter.post("/logout", logout);

export default authRouter;