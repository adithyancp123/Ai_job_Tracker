import { NextFunction, Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { HttpError } from "../services/auth.service";
import authService from "../services/auth.service";

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      throw new HttpError("Name, email and password are required.", 400);
    }

    const result = await authService.register({ name, email, password });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new HttpError("Email and password are required.", 400);
    }

    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getProtected = (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): void => {
  res.json({
    message: "Protected route accessed successfully.",
    user: req.user
  });
};

const authController = {
  register,
  login,
  getProtected
};

export default authController;
