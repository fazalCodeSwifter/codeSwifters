import express from "express";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { userController } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/users", isAuth, userController);

export default router;
