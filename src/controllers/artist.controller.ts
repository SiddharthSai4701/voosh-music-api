import { Request, Response } from "express";
import { pool } from "../config/database";
import { AuthRequest } from "../middleware/auth";

export const getAllArtists = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { limit = 5, offset = 0, grammy, hidden }: any = req.query;
    let query = `
      SELECT artist_id, name, grammy, hidden 
      FROM artists 
      WHERE org_id = $1
    `;
    const params = [req.user?.org_id];

    if (grammy !== undefined) {
      query += ` AND grammy = $${params.length + 1}`;
      params.push(grammy);
    }

    if (hidden !== undefined) {
      query += ` AND hidden = $${params.length + 1}`;
      params.push(hidden === "true" ? "true" : "false");
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit as string, offset as string);

    const artists = await pool.query(query, params);

    res.status(200).json({
      status: 200,
      data: artists.rows,
      message: "Artists retrieved successfully.",
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

export const getArtist = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const artistId = req.params.id;
    const artist = await pool.query(
      "SELECT artist_id, name, grammy, hidden FROM artists WHERE artist_id = $1 AND org_id = $2",
      [artistId, req.user?.org_id]
    );

    if (artist.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: artist.rows[0],
      message: "Artist retrieved successfully.",
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

export const addArtist = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { name, grammy, hidden } = req.body;
    await pool.query(
      "INSERT INTO artists (name, grammy, hidden, org_id) VALUES ($1, $2, $3, $4)",
      [name, grammy, hidden, req.user?.org_id]
    );

    res.status(201).json({
      status: 201,
      data: null,
      message: "Artist created successfully.",
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

export const updateArtist = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const artistId = req.params.id;
    const { name, grammy, hidden } = req.body;

    const result = await pool.query(
      "UPDATE artists SET name = $1, grammy = $2, hidden = $3 WHERE artist_id = $4 AND org_id = $5",
      [name, grammy, hidden, artistId, req.user?.org_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: "Bad Request",
      error: null,
    });
  }
};

export const deleteArtist = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const artistId = req.params.id;
    const artist = await pool.query(
      "SELECT name FROM artists WHERE artist_id = $1 AND org_id = $2",
      [artistId, req.user?.org_id]
    );

    if (artist.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    await pool.query("DELETE FROM artists WHERE artist_id = $1", [artistId]);

    res.status(200).json({
      status: 200,
      data: { artist_id: artistId },
      message: `Artist:${artist.rows[0].name} deleted successfully.`,
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