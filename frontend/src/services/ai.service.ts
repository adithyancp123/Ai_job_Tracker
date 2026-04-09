import api from "./api";
import type { ParsedJobData } from "../types/application.types";

interface ResumeSuggestionsResponse {
  suggestions: string[];
}

const parseJobDescription = async (jobDescriptionText: string): Promise<ParsedJobData> => {
  const { data } = await api.post<ParsedJobData>("http://localhost:5000/api/ai/parse-job", {
    description: jobDescriptionText
  });
  if (
    !data ||
    typeof data.company !== "string" ||
    typeof data.role !== "string" ||
    !Array.isArray(data.requiredSkills) ||
    !Array.isArray(data.niceToHaveSkills) ||
    typeof data.seniority !== "string" ||
    typeof data.location !== "string"
  ) {
    throw new Error("Invalid AI parse response.");
  }
  return data;
};

const getResumeSuggestions = async (jobDescriptionText: string): Promise<string[]> => {
  const { data } = await api.post<ResumeSuggestionsResponse>("/api/ai/resume-suggestions", {
    jobDescriptionText
  });
  if (!data || !Array.isArray(data.suggestions)) {
    throw new Error("Invalid AI suggestions response.");
  }
  return data.suggestions;
};

const aiService = {
  parseJobDescription,
  getResumeSuggestions
};

export default aiService;
