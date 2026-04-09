import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AuthPayload, HttpError } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError("Authorization token is required.", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new HttpError("JWT_SECRET is not configured.", 500);
    }

    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpError("Invalid or expired token.", 401));
      return;
    }
    next(error);
  }
};

export default authMiddleware;
