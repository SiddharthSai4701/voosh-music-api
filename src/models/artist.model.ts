import { pool } from '../config/database';

export class ArtistModel {
    static async create(name: string, grammy: number, hidden: boolean, orgId: string | undefined) {
        return pool.query(
            "INSERT INTO artists (name, grammy, hidden, org_id) VALUES ($1, $2, $3, $4)",
            [name, grammy, hidden, orgId]
        );
    }

    static async findByOrgId(artistId: string, orgId: string) {
        return pool.query(
            "SELECT * FROM artists WHERE artist_id = $1 AND org_id = $2",
            [artistId, orgId]
        );
    }
}
