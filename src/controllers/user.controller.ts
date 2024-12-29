import { Request, RequestHandler, Response } from "express";
import { pool } from "../config/database";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse, UserResponse } from "../types/response";
import { AddUserRequest } from "../types/request";

export const getAllUsers: RequestHandler<{}, UserResponse> = async (
  req: AuthRequest,
  res
) => {
  try {
    const { limit = 5, offset = 0, role } = req.query;
    let query = `
            SELECT user_id, email, role, created_at 
            FROM users 
            WHERE org_id = $1
        `;
    const params = [req.user?.org_id];

    if (role) {
      query += ` AND role = $2`;
      params.push(role as string);
    }

    query += ` LIMIT ${params.length + 1} OFFSET ${params.length + 2}`;
    params.push(limit as string, offset as string);

    const users = await pool.query(query, params);

    res.status(200).json({
      status: 200,
      data: users.rows,
      message: "Users retrieved successfully.",
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
export const addUser: RequestHandler<{}, ApiResponse, AddUserRequest> = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (role === "admin") {
      res.status(403).json({
        status: 403,
        data: null,
        message: "Cannot create admin users",
        error: null,
      });
      return;
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      res.status(409).json({
        status: 409,
        data: null,
        message: "Email already exists.",
        error: null,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password, role, org_id) VALUES ($1, $2, $3, $4)",
      [email, hashedPassword, role, req.user?.org_id]
    );

    res.status(201).json({
      status: 201,
      data: null,
      message: "User created successfully.",
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
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.params.id;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE user_id = $1 AND org_id = $2",
      [userId, req.user?.org_id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    if (userExists.rows[0].role === "admin") {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Cannot delete admin user.",
        error: null,
      });
    }

    await pool.query("DELETE FROM users WHERE user_id = $1", [userId]);

    res.status(200).json({
      status: 200,
      data: null,
      message: "User deleted successfully.",
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

export const updatePassword = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { old_password, new_password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      req.user?.user_id,
    ]);

    const isValidPassword = await bcrypt.compare(
      old_password,
      user.rows[0].password
    );

    if (!isValidPassword) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid old password.",
        error: null,
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [
      hashedPassword,
      req.user?.user_id,
    ]);

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
