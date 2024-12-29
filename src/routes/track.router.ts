import { Router } from "express";
import {
  getAllTracks,
  getTrack,
  addTrack,
  updateTrack,
  deleteTrack,
} from "../controllers/track.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/tracks", authMiddleware, getAllTracks);
router.get("/tracks/:id", authMiddleware, getTrack);
router.post("/tracks/add-track", authMiddleware, addTrack);
router.put("/tracks/:id", authMiddleware, updateTrack);
router.delete("/tracks/:id", authMiddleware, deleteTrack);

export default router;
