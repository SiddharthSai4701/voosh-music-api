import { Router, Response } from "express";
import {
  getAllUsers,
  addUser,
  deleteUser,
  updatePassword,
} from "../controllers/user.controller";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/users", authMiddleware, getAllUsers);
router.post("/users/add-user", authMiddleware, addUser);

router.delete("/users/:id", authMiddleware, deleteUser);
router.put("/users/update-password", authMiddleware, updatePassword);

export default router;
