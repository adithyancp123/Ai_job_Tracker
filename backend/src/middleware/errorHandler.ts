import { NextFunction, Request, Response } from "express";

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: ErrorWithStatusCode,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error"
  });
};

export default errorHandler;
