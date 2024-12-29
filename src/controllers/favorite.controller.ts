import { Request, Response } from "express";
import { pool } from "../config/database";
import { AuthRequest } from "../middleware/auth";

export const getFavorites = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { limit = 5, offset = 0 } = req.query;
    const category = req.params.category;

    if (!["artist", "album", "track"].includes(category)) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid category.",
        error: null,
      });
    }

    const query = `
      SELECT f.favorite_id, f.category, f.item_id, 
             CASE 
               WHEN f.category = 'artist' THEN art.name
               WHEN f.category = 'album' THEN alb.name
               WHEN f.category = 'track' THEN t.name
             END as name,
             f.created_at
      FROM favorites f
      LEFT JOIN artists art ON f.category = 'artist' AND f.item_id::uuid = art.artist_id
      LEFT JOIN albums alb ON f.category = 'album' AND f.item_id::uuid = alb.album_id
      LEFT JOIN tracks t ON f.category = 'track' AND f.item_id::uuid = t.track_id
      WHERE f.user_id = $1 AND f.category = $2
      LIMIT $3 OFFSET $4
    `;

    const favorites = await pool.query(query, [
      req.user?.user_id,
      category,
      limit,
      offset,
    ]);

    res.status(200).json({
      status: 200,
      data: favorites.rows,
      message: "Favorites retrieved successfully.",
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: "Bad Request",
      error: null,
    });
  }
};

export const addFavorite = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { category, item_id } = req.body;

    if (!["artist", "album", "track"].includes(category)) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid category.",
        error: null,
      });
    }

    let itemExists;
    switch (category) {
      case "artist":
        itemExists = await pool.query(
          "SELECT * FROM artists WHERE artist_id = $1 AND org_id = $2",
          [item_id, req.user?.org_id]
        );
        break;
      case "album":
        itemExists = await pool.query(
          `SELECT * FROM albums a
           JOIN artists art ON a.artist_id = art.artist_id
           WHERE a.album_id = $1 AND art.org_id = $2`,
          [item_id, req.user?.org_id]
        );
        break;
      case "track":
        itemExists = await pool.query(
          `SELECT * FROM tracks t
           JOIN artists art ON t.artist_id = art.artist_id
           WHERE t.track_id = $1 AND art.org_id = $2`,
          [item_id, req.user?.org_id]
        );
        break;
    }

    if (!itemExists?.rows.length) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Item not found.",
        error: null,
      });
    }

    await pool.query(
      "INSERT INTO favorites (user_id, category, item_id) VALUES ($1, $2, $3)",
      [req.user?.user_id, category, item_id]
    );

    res.status(201).json({
      status: 201,
      data: null,
      message: "Favorite added successfully.",
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: "Bad Request",
      error: null,
    });
  }
};

export const removeFavorite = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const favoriteId = req.params.id;

    const result = await pool.query(
      "DELETE FROM favorites WHERE favorite_id = $1 AND user_id = $2",
      [favoriteId, req.user?.user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Favorite not found.",
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: null,
      message: "Favorite removed successfully.",
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: "Bad Request",
      error: null,
    });
  }
};
