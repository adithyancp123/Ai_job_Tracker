import OpenAI from "openai";

import { HttpError } from "./auth.service";

export interface ParsedJobDescription {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

const getClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new HttpError("OPENAI_API_KEY is not configured.", 500);
  }
  return new OpenAI({ apiKey });
};

const safeParseJson = <T>(value: string): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new HttpError("Invalid AI response format.", 502);
  }
};

const parseJobDescription = async (
  jobDescriptionText: string
): Promise<ParsedJobDescription> => {
  if (!jobDescriptionText.trim()) {
    throw new HttpError("description is required.", 400);
  }

  const client = getClient();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Extract structured job data from this description. Return strictly valid JSON with keys: company, role, requiredSkills (array), niceToHaveSkills (array), seniority, location."
      },
      {
        role: "user",
        content: jobDescriptionText
      }
    ]
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new HttpError("AI returned an empty response.", 502);
  }

  const parsed = safeParseJson<ParsedJobDescription>(outputText);

  if (
    !parsed.company ||
    !parsed.role ||
    !Array.isArray(parsed.requiredSkills) ||
    !Array.isArray(parsed.niceToHaveSkills) ||
    !parsed.seniority ||
    !parsed.location
  ) {
    throw new HttpError("AI returned incomplete job parsing data.", 502);
  }

  return {
    company: String(parsed.company),
    role: String(parsed.role),
    requiredSkills: parsed.requiredSkills.map(String),
    niceToHaveSkills: parsed.niceToHaveSkills.map(String),
    seniority: String(parsed.seniority),
    location: String(parsed.location)
  };
};

const getResumeSuggestions = async (jobDescriptionText: string): Promise<string[]> => {
  if (!jobDescriptionText.trim()) {
    throw new HttpError("jobDescriptionText is required.", 400);
  }

  const client = getClient();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Generate 3 to 5 concise resume bullet points tailored to the job description. Return strictly valid JSON array of strings only."
      },
      {
        role: "user",
        content: jobDescriptionText
      }
    ]
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new HttpError("AI returned an empty response.", 502);
  }

  const suggestions = safeParseJson<string[]>(outputText);
  if (!Array.isArray(suggestions)) {
    throw new HttpError("AI returned invalid suggestions format.", 502);
  }

  const cleaned = suggestions.map((item) => String(item).trim()).filter(Boolean);
  if (cleaned.length < 3 || cleaned.length > 5) {
    throw new HttpError("AI must return between 3 and 5 suggestions.", 502);
  }

  return cleaned;
};

const aiService = {
  parseJobDescription,
  getResumeSuggestions
};

export default aiService;
