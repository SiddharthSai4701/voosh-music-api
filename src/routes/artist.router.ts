import { Router, Response } from "express";
import { getAllArtists, getArtist, addArtist, updateArtist, deleteArtist } from "../controllers/artist.controller";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/artists", authMiddleware, getAllArtists);
router.get("/artists/:id", authMiddleware, getArtist);
router.post("/artists/add-artist", authMiddleware, addArtist);
router.put("/artists/:id", authMiddleware, updateArtist);
router.delete("/artists/:id", authMiddleware, deleteArtist);

export default router;
