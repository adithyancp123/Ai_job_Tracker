import { Types } from "mongoose";

import JobApplication, {
  IJobApplication,
  JOB_STATUSES,
  JobStatus
} from "../models/jobApplication.model";
import { HttpError } from "./auth.service";

export interface CreateJobApplicationInput {
  company: string;
  role: string;
  jobDescriptionLink?: string;
  notes: string;
  dateApplied: string;
  status: JobStatus;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location: string;
}

export type UpdateJobApplicationInput = Partial<CreateJobApplicationInput>;

const ensureValidStatus = (status?: string): void => {
  if (status && !JOB_STATUSES.includes(status as JobStatus)) {
    throw new HttpError("Invalid job application status.", 400);
  }
};

const create = async (
  userId: string,
  input: CreateJobApplicationInput
): Promise<IJobApplication> => {
  ensureValidStatus(input.status);

  const created = await JobApplication.create({
    ...input,
    jobDescriptionLink: input.jobDescriptionLink?.trim() || undefined,
    niceToHaveSkills: input.niceToHaveSkills || [],
    seniority: input.seniority?.trim() || undefined,
    dateApplied: new Date(input.dateApplied),
    lastUpdatedDate: new Date(),
    userId: new Types.ObjectId(userId)
  });

  return created;
};

const getAllForUser = async (userId: string): Promise<IJobApplication[]> => {
  return JobApplication.find({ userId }).sort({ dateApplied: -1, createdAt: -1 });
};

const update = async (
  userId: string,
  applicationId: string,
  input: UpdateJobApplicationInput
): Promise<IJobApplication> => {
  ensureValidStatus(input.status);

  const updatePayload = {
    ...input,
    ...(input.jobDescriptionLink !== undefined
      ? { jobDescriptionLink: input.jobDescriptionLink?.trim() || undefined }
      : {}),
    ...(input.niceToHaveSkills !== undefined ? { niceToHaveSkills: input.niceToHaveSkills } : {}),
    ...(input.seniority !== undefined ? { seniority: input.seniority?.trim() || undefined } : {}),
    ...(input.dateApplied ? { dateApplied: new Date(input.dateApplied) } : {}),
    lastUpdatedDate: new Date()
  };

  const updated = await JobApplication.findOneAndUpdate(
    { _id: applicationId, userId },
    updatePayload,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new HttpError("Job application not found.", 404);
  }

  return updated;
};

const remove = async (userId: string, applicationId: string): Promise<void> => {
  const deleted = await JobApplication.findOneAndDelete({ _id: applicationId, userId });
  if (!deleted) {
    throw new HttpError("Job application not found.", 404);
  }
};

const jobApplicationService = {
  create,
  getAllForUser,
  update,
  remove
};

export default jobApplicationService;
