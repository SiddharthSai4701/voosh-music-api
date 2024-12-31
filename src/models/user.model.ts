import { pool } from "../config/database";

export class UserModel {
  static async create(
    email: string,
    hashedPassword: string,
    role: string,
    orgId: string
  ) {
    return pool.query(
      "INSERT INTO users (email, password, role, org_id) VALUES ($1, $2, $3, $4)",
      [email, hashedPassword, role, orgId]
    );
  }

  static async findByEmail(email: string) {
    return pool.query("SELECT * FROM users WHERE email = $1", [email]);
  }
}
