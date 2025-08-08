import express from "express";
import {
  createProduct,
  deleteProduct,
  geAlltProducts,
  singleProduct,
  updateProduct,
} from "../controllers/products.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";
const router = express.Router();

router.get("/get-products", geAlltProducts);
router.get("/get-products/:id", singleProduct);
router.post("/create-product", [isAuth, isAdmin], createProduct);
router.put("/update-product/:id", [isAuth, isAdmin], updateProduct);
router.delete("/delete-product/:id", [isAuth, isAdmin], deleteProduct);

export default router;
