import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  CreateJobApplicationInput,
  UpdateJobApplicationInput
} from "../services/jobApplication.service";
import { HttpError } from "../services/auth.service";
import jobApplicationService from "../services/jobApplication.service";

const requireUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError("Unauthorized.", 401);
  }
  return userId;
};

const createApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const payload = req.body as CreateJobApplicationInput;

    const created = await jobApplicationService.create(userId, payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const applications = await jobApplicationService.getAllForUser(userId);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const { id } = req.params as { id: string };
    const payload = req.body as UpdateJobApplicationInput;

    const updated = await jobApplicationService.update(userId, id, payload);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const { id } = req.params as { id: string };
    await jobApplicationService.remove(userId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const jobApplicationController = {
  createApplication,
  getMyApplications,
  updateApplication,
  deleteApplication
};

export default jobApplicationController;
