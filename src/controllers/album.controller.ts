import { Request, Response } from "express";
import { pool } from "../config/database";
import { AuthRequest } from "../middleware/auth";

export const getAllAlbums = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { limit = 5, offset = 0, artist_id, hidden }: any = req.query;
    let query = `
      SELECT a.album_id, art.name as artist_name, a.name, a.year, a.hidden
      FROM albums a
      JOIN artists art ON a.artist_id = art.artist_id
      WHERE art.org_id = $1
    `;
    const params = [req.user?.org_id];

    if (artist_id) {
      query += ` AND a.artist_id = $${params.length + 1}`;
      params.push(artist_id);
    }

    if (hidden !== undefined) {
      query += ` AND a.hidden = $${params.length + 1}`;
      params.push(hidden === "true" ? "true" : "false");
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit as string, offset as string);

    const albums = await pool.query(query, params);

    res.status(200).json({
      status: 200,
      data: albums.rows,
      message: "Albums retrieved successfully.",
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

export const getAlbum = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const albumId = req.params.id;
    const album = await pool.query(
      `SELECT a.album_id, art.name as artist_name, a.name, a.year, a.hidden
       FROM albums a
       JOIN artists art ON a.artist_id = art.artist_id
       WHERE a.album_id = $1 AND art.org_id = $2`,
      [albumId, req.user?.org_id]
    );

    if (album.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: album.rows[0],
      message: "Album retrieved successfully.",
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

export const addAlbum = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { artist_id, name, year, hidden } = req.body;

    // Verify artist belongs to organization
    const artistCheck = await pool.query(
      "SELECT * FROM artists WHERE artist_id = $1 AND org_id = $2",
      [artist_id, req.user?.org_id]
    );

    if (artistCheck.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    await pool.query(
      "INSERT INTO albums (artist_id, name, year, hidden) VALUES ($1, $2, $3, $4)",
      [artist_id, name, year, hidden]
    );

    res.status(201).json({
      status: 201,
      data: null,
      message: "Album created successfully.",
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

export const updateAlbum = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const albumId = req.params.id;
    const { name, year, hidden } = req.body;

    const result = await pool.query(
      `UPDATE albums SET name = $1, year = $2, hidden = $3 
       WHERE album_id = $4 AND artist_id IN 
       (SELECT artist_id FROM artists WHERE org_id = $5)`,
      [name, year, hidden, albumId, req.user?.org_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Album not found.",
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

export const deleteAlbum = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const albumId = req.params.id;

    const album = await pool.query(
      `SELECT albums.name FROM albums 
       JOIN artists ON albums.artist_id = artists.artist_id 
       WHERE album_id = $1 AND artists.org_id = $2`,
      [albumId, req.user?.org_id]
    );

    if (album.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    await pool.query("DELETE FROM albums WHERE album_id = $1", [albumId]);

    res.status(200).json({
      status: 200,
      data: null,
      message: `Album:${album.rows[0].name} deleted successfully.`,
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
