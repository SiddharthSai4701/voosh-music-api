import { pool } from "../config/database";

export class FavoriteModel {
  static async create(userId: string, category: string, itemId: string) {
    return pool.query(
      "INSERT INTO favorites (user_id, category, item_id) VALUES ($1, $2, $3)",
      [userId, category, itemId]
    );
  }

  static async findItem(category: 'artist' | 'album' | 'track', itemId: string, orgId: string) {
    const queries = {
      artist: "SELECT * FROM artists WHERE artist_id = $1 AND org_id = $2",
      album: `SELECT * FROM albums a
             JOIN artists art ON a.artist_id = art.artist_id
             WHERE a.album_id = $1 AND art.org_id = $2`,
      track: `SELECT * FROM tracks t
             JOIN artists art ON t.artist_id = art.artist_id
             WHERE t.track_id = $1 AND art.org_id = $2`,
    };
    return pool.query(queries[category], [itemId, orgId]);
  }
}
