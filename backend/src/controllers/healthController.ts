import { Request, Response } from "express";

import healthService from "../services/healthService";

export const getHealth = (_req: Request, res: Response): void => {
  res.json(healthService.getStatus());
};
