import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    org_id: string;
    role: string;
  };
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );
    req.user = decoded as any;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      data: null,
      message: "Unauthorized Access",
      error: null,
    });
  }
};

export { authMiddleware, AuthRequest };
