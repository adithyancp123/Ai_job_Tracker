export const KANBAN_COLUMNS = [
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected"
] as const;

export type ApplicationStatus = (typeof KANBAN_COLUMNS)[number];

export interface JobApplication {
  _id: string;
  company: string;
  role: string;
  jobDescriptionLink?: string;
  notes?: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange?: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
}

export interface CreateJobApplicationPayload {
  company: string;
  role: string;
  jobDescriptionLink?: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location: string;
}

export type UpdateJobApplicationPayload = Partial<CreateJobApplicationPayload>;

export interface ParsedJobData {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}
