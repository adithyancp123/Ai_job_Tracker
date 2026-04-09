import api from "./api";
import type {
  ApplicationStatus,
  CreateJobApplicationPayload,
  JobApplication,
  UpdateJobApplicationPayload
} from "../types/application.types";

const getApplications = async (): Promise<JobApplication[]> => {
  const { data } = await api.get<JobApplication[]>("/applications");
  return data;
};

const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus
): Promise<JobApplication> => {
  const { data } = await api.put<JobApplication>(`/applications/${id}`, { status });
  return data;
};

const createApplication = async (
  payload: CreateJobApplicationPayload
): Promise<JobApplication> => {
  const { data } = await api.post<JobApplication>("/applications", payload);
  return data;
};

const updateApplication = async (
  id: string,
  payload: UpdateJobApplicationPayload
): Promise<JobApplication> => {
  const { data } = await api.put<JobApplication>(`/applications/${id}`, payload);
  return data;
};

const deleteApplication = async (id: string): Promise<void> => {
  await api.delete(`/applications/${id}`);
};

const applicationsService = {
  getApplications,
  updateApplicationStatus,
  createApplication,
  updateApplication,
  deleteApplication
};

export default applicationsService;
