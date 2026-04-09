import mongoose, { Schema, Types } from "mongoose";

export const JOB_STATUSES = [
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected"
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface IJobApplication {
  company: string;
  role: string;
  jobDescriptionLink?: string;
  notes: string;
  dateApplied: Date;
  status: JobStatus;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location: string;
  lastUpdatedDate: Date;
  userId: Types.ObjectId;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jobDescriptionLink: { type: String, required: false, trim: true },
    notes: { type: String, required: true, trim: true },
    dateApplied: { type: Date, required: true },
    status: { type: String, enum: JOB_STATUSES, default: "Applied", required: true },
    salaryRange: { type: String, required: false, trim: true },
    requiredSkills: { type: [String], default: [] },
    niceToHaveSkills: { type: [String], default: [] },
    seniority: { type: String, required: false, trim: true },
    location: { type: String, required: true, trim: true },
    lastUpdatedDate: { type: Date, required: true, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

const JobApplication = mongoose.model<IJobApplication>("JobApplication", jobApplicationSchema);

export default JobApplication;
