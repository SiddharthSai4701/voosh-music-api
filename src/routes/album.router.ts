import { Router } from "express";
import {
  getAllAlbums,
  getAlbum,
  addAlbum,
  updateAlbum,
  deleteAlbum,
} from "../controllers/album.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/albums", authMiddleware, getAllAlbums);
router.get("/albums/:id", authMiddleware, getAlbum);
router.post("/albums/add-album", authMiddleware, addAlbum);
router.put("/albums/:id", authMiddleware, updateAlbum);
router.delete("/albums/:id", authMiddleware, deleteAlbum);

export default router;
