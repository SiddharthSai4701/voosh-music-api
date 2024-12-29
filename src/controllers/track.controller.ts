import { Request, Response } from "express";
import { pool } from "../config/database";
import { AuthRequest } from "../middleware/auth";

export const getAllTracks = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      limit = 5,
      offset = 0,
      artist_id,
      album_id,
      hidden,
    }: any = req.query;
    let query = `
      SELECT t.track_id, art.name as artist_name, alb.name as album_name, 
             t.name, t.duration, t.hidden
      FROM tracks t
      JOIN artists art ON t.artist_id = art.artist_id
      JOIN albums alb ON t.album_id = alb.album_id
      WHERE art.org_id = $1
    `;
    const params = [req.user?.org_id];

    if (artist_id) {
      query += ` AND t.artist_id = $${params.length + 1}`;
      params.push(artist_id);
    }

    if (album_id) {
      query += ` AND t.album_id = $${params.length + 1}`;
      params.push(album_id);
    }

    if (hidden !== undefined) {
      query += ` AND t.hidden = $${params.length + 1}`;
      params.push(hidden === "true" ? "true" : "false");
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit as string, offset as string);

    const tracks = await pool.query(query, params);

    res.status(200).json({
      status: 200,
      data: tracks.rows,
      message: "Tracks retrieved successfully.",
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

export const getTrack = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const trackId = req.params.id;
    const track = await pool.query(
      `SELECT t.track_id, art.name as artist_name, alb.name as album_name, 
              t.name, t.duration, t.hidden
       FROM tracks t
       JOIN artists art ON t.artist_id = art.artist_id
       JOIN albums alb ON t.album_id = alb.album_id
       WHERE t.track_id = $1 AND art.org_id = $2`,
      [trackId, req.user?.org_id]
    );

    if (track.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Track not found.",
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: track.rows[0],
      message: "Track retrieved successfully.",
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

export const addTrack = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { artist_id, album_id, name, duration, hidden } = req.body;

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

    const albumCheck = await pool.query(
      "SELECT * FROM albums WHERE album_id = $1 AND artist_id = $2",
      [album_id, artist_id]
    );

    if (albumCheck.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    await pool.query(
      "INSERT INTO tracks (artist_id, album_id, name, duration, hidden) VALUES ($1, $2, $3, $4, $5)",
      [artist_id, album_id, name, duration, hidden]
    );

    res.status(201).json({
      status: 201,
      data: null,
      message: "Track created successfully.",
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

export const updateTrack = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const trackId = req.params.id;
    const { name, duration, hidden } = req.body;

    const result = await pool.query(
      `UPDATE tracks SET name = $1, duration = $2, hidden = $3 
       WHERE track_id = $4 AND artist_id IN 
       (SELECT artist_id FROM artists WHERE org_id = $5)`,
      [name, duration, hidden, trackId, req.user?.org_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Track not found.",
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

export const deleteTrack = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const trackId = req.params.id;

    const track = await pool.query(
      `SELECT tracks.name FROM tracks 
       JOIN artists ON tracks.artist_id = artists.artist_id 
       WHERE track_id = $1 AND artists.org_id = $2`,
      [trackId, req.user?.org_id]
    );

    if (track.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Track not found.",
        error: null,
      });
    }

    await pool.query("DELETE FROM tracks WHERE track_id = $1", [trackId]);

    res.status(200).json({
      status: 200,
      data: null,
      message: `Track:${track.rows[0].name} deleted successfully.`,
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
