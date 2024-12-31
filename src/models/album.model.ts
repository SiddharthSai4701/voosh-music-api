import { pool } from "../config/database";

export class AlbumModel {
  static async create(
    artistId: string,
    name: string,
    year: number,
    hidden: boolean
  ) {
    return pool.query(
      "INSERT INTO albums (artist_id, name, year, hidden) VALUES ($1, $2, $3, $4)",
      [artistId, name, year, hidden]
    );
  }

  static async findByArtistAndOrg(albumId: string, artistId: string) {
    return pool.query(
      "SELECT * FROM albums WHERE album_id = $1 AND artist_id = $2",
      [albumId, artistId]
    );
  }
}
