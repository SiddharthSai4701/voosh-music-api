import { Request, RequestHandler, Response } from "express";
import { pool } from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse, LoginResponse } from "../types/response";
import { LoginRequest, SignupRequest } from "../types/request";

export const signup: RequestHandler<{}, ApiResponse, SignupRequest> = async (
  req,
  res
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request - Email and password are required.",
        error: null,
      });
    }

    // Check if email exists
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
    }

    const organization = req.body?.organization
      ? req.body.organization
      : "Default Test Organization";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization first
    const org = await pool.query(
      "INSERT INTO organizations (name) VALUES ($1) RETURNING org_id",
      [organization]
    );

    // Check if this is the first user (will be admin)
    const allUsers = await pool.query("SELECT * FROM users");
    const role = allUsers.rows.length === 0 ? "admin" : "viewer";

    // Create user
    const result = await pool.query(
      "INSERT INTO users (email, password, role, org_id) VALUES ($1, $2, $3, $4) RETURNING user_id",
      [email, hashedPassword, role, org.rows[0].org_id]
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

export const login: RequestHandler<{}, LoginResponse, LoginRequest> = async (
  req,
  res
) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid credentials.",
        error: null,
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, org_id: user.org_id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      status: 200,
      data: { token },
      message: "Login successful.",
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

export const logout: RequestHandler<{}, ApiResponse> = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: null,
      message: "User logged out successfully.",
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
