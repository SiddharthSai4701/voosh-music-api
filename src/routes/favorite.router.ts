import { Router } from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../controllers/favorite.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/favorites/:category", authMiddleware, getFavorites);
router.post("/favorites/add-favorite", authMiddleware, addFavorite);
router.delete("/favorites/remove-favorite/:id", authMiddleware, removeFavorite);

export default router;
