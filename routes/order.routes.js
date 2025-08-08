import express from "express";
import {
  createOrder,
  getAllOrders,
  getSingleOrder,
} from "../controllers/order.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = express.Router();

router.get("/all-orders", [isAuth, isAdmin], getAllOrders);
router.get("/get-order/:id", [isAuth, isAdmin], getSingleOrder);
router.post("/create-order", [isAuth], createOrder);

export default router;
