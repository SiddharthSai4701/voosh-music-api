import { Router } from "express";
import { signup, login, logout } from "../controllers/auth.controller";
import { SignupRequest } from "../types/request";
import { ApiResponse } from "../types/response";

const router = Router();

router.post(
  "/signup",
    signup
);
router.post("/login", login);
router.get("/logout", logout)
export default router;
