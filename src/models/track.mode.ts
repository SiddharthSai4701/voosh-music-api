import { pool } from "../config/database";

export class TrackModel {
  static async create(
    artistId: string,
    albumId: string,
    name: string,
    duration: number,
    hidden: boolean
  ) {
    return pool.query(
      "INSERT INTO tracks (artist_id, album_id, name, duration, hidden) VALUES ($1, $2, $3, $4, $5)",
      [artistId, albumId, name, duration, hidden]
    );
  }
}
