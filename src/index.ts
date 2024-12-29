import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/database";
import "./migrations/tables";
import authRoutes from "./routes/auth.router";
import userRoutes from "./routes/user.router";
import artistRoutes from "./routes/artist.router";
import albumRoutes from "./routes/album.router";
import trackRoutes from "./routes/track.router";
import favoriteRoutes from "./routes/favorite.router";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", artistRoutes);
app.use("/api/v1", albumRoutes);
app.use("/api/v1", trackRoutes);
app.use("/api/v1", favoriteRoutes);

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("Database connected successfully");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
