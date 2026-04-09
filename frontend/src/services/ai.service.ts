import api from "./api";
import type { ParsedJobData } from "../types/application.types";

interface ResumeSuggestionsResponse {
  suggestions: string[];
}

type StreamDeltaHandler = (delta: string) => void;

const parseJsonFromText = (text: string): unknown => {
  let cleaned = (text || "").replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned) as unknown;
};

const streamSseText = async (
  url: string,
  body: unknown,
  onDelta?: StreamDeltaHandler
): Promise<string> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed (${res.status})`);
  }

  if (!res.body) throw new Error("Streaming response not supported by browser.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const sep = buffer.indexOf("\n\n");
      if (sep === -1) break;

      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      const dataLines = rawEvent
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim());

      if (dataLines.length === 0) continue;
      const dataStr = dataLines.join("\n");

      let payload: { type?: unknown; text?: unknown; message?: unknown };
      try {
        payload = JSON.parse(dataStr) as typeof payload;
      } catch {
        continue;
      }

      if (payload.type === "delta" && typeof payload.text === "string") {
        fullText += payload.text;
        onDelta?.(payload.text);
      } else if (payload.type === "error" && typeof payload.message === "string") {
        throw new Error(payload.message);
      } else if (payload.type === "done") {
        return fullText;
      }
    }
  }

  return fullText;
};

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

const streamParseJobDescription = async (
  jobDescriptionText: string,
  onDelta?: StreamDeltaHandler
): Promise<ParsedJobData> => {
  const text = await streamSseText("http://localhost:5000/api/ai/parse-job/stream", {
    description: jobDescriptionText
  }, onDelta);

  const parsed = parseJsonFromText(text) as Partial<ParsedJobData>;
  return {
    company: typeof parsed.company === "string" ? parsed.company : "",
    role: typeof parsed.role === "string" ? parsed.role : "",
    requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills.map(String) : [],
    niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills.map(String) : [],
    seniority: typeof parsed.seniority === "string" ? parsed.seniority : "",
    location: typeof parsed.location === "string" ? parsed.location : ""
  };
};

const streamResumeSuggestions = async (
  jobDescriptionText: string,
  onDelta?: StreamDeltaHandler
): Promise<string[]> => {
  const text = await streamSseText("http://localhost:5000/api/ai/resume-suggestions/stream", {
    jobDescriptionText
  }, onDelta);

  const parsed = parseJsonFromText(text) as { suggestions?: unknown };
  if (!parsed || !Array.isArray(parsed.suggestions)) throw new Error("Invalid AI suggestions response.");
  return parsed.suggestions.map((v) => String(v)).filter(Boolean).slice(0, 5);
};

const aiService = {
  parseJobDescription,
  getResumeSuggestions,
  streamParseJobDescription,
  streamResumeSuggestions
};

export default aiService;
