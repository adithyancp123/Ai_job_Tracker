import { Request, Response } from "express";
import OpenAI from "openai";

const getClient = (): OpenAI => {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  return new OpenAI({ apiKey });
};

const extractResponseText = (response: unknown): string => {
  const data = response as {
    output_text?: string;
    output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  };

  let text = data.output_text || "";
  if (!text && Array.isArray(data.output)) {
    const textParts: string[] = [];
    for (const item of data.output) {
      if (item.type !== "message") continue;
      for (const part of item.content || []) {
        if (part.type === "output_text") {
          textParts.push(part.text || "");
        }
      }
    }
    text = textParts.join("\n").trim();
  }
  // Fallback for legacy/non-typed shape: response.output[0].content[0].text
  if (!text && Array.isArray(data.output) && data.output[0]?.content?.[0]?.text) {
    text = String(data.output[0].content[0].text).trim();
  }
  return text;
};

const fallbackParseJob = (description: string) => {
  const text = description || "";
  const lower = text.toLowerCase();

  const roleMatch = text.match(/hiring\s+(?:a|an)?\s*([A-Za-z0-9\s\-+/]+)/i);
  const companyMatch = text.match(/at\s+([A-Za-z0-9&.\-\s]{2,40})/i);
  const yearsMatch = text.match(/(\d+\+?)\s*(?:years|yrs)/i);

  const knownSkills = [
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Express",
    "MongoDB",
    "Tailwind CSS",
    "REST APIs",
    "Docker",
    "AWS",
    "Git"
  ];

  const requiredSkills = knownSkills.filter((skill) =>
    lower.includes(skill.toLowerCase())
  );

  const niceToHaveSkills = lower.includes("nice to have")
    ? requiredSkills.slice(0, Math.min(2, requiredSkills.length))
    : [];

  const location = lower.includes("remote")
    ? "Remote"
    : lower.includes("hybrid")
      ? "Hybrid"
      : lower.includes("on-site") || lower.includes("onsite")
        ? "On-site"
        : "";

  const seniority = yearsMatch
    ? `${yearsMatch[1]} years`
    : lower.includes("senior")
      ? "Senior"
      : lower.includes("junior")
        ? "Junior"
        : "";

  return {
    company: companyMatch?.[1]?.trim() || "",
    role: roleMatch?.[1]?.trim() || "",
    requiredSkills,
    niceToHaveSkills,
    location,
    seniority
  };
};

const fallbackResumeSuggestions = (description: string): string[] => {
  const parsed = fallbackParseJob(description);
  const role = parsed.role || "the role";
  const company = parsed.company ? ` at ${parsed.company}` : "";
  const skills = parsed.requiredSkills.slice(0, 4);
  const skillsText = skills.length ? ` using ${skills.join(", ")}` : "";

  const suggestions = [
    `Built and shipped frontend features for ${role}${company}${skillsText}, focusing on performance, accessibility, and clean UX.`,
    `Collaborated with cross-functional teams to translate requirements into scalable UI components and well-tested integrations.`,
    `Improved reliability by adding error handling, monitoring, and clear API contracts for key user workflows.`,
    `Optimized developer productivity by standardizing reusable patterns, reducing duplication, and improving code maintainability.`,
    `Delivered iterative improvements based on feedback, improving user experience and feature adoption.`
  ];

  return suggestions.slice(0, 5);
};

export const parseJob = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { description } = req.body as { description?: string };

    if (!description) {
      return res.status(400).json({ error: "No description provided" });
    }
    const apiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey || apiKey === "dummy_key") {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing or invalid" });
    }

    const prompt = `
Extract structured information from this job description.

Return ONLY valid JSON in this format:
{
  "company": "string",
  "role": "string",
  "requiredSkills": ["string"],
  "niceToHaveSkills": ["string"],
  "location": "string",
  "seniority": "string"
}

Job Description:
${description}
      `;

    let response: Awaited<ReturnType<OpenAI["responses"]["create"]>>;
    try {
      const client = getClient();
      response = await client.responses.create({
        model: "gpt-4o-mini",
        input: prompt
      });
    } catch {
      const client = getClient();
      response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt
      });
    }

    let text = extractResponseText(response);

    // eslint-disable-next-line no-console
    console.log("AI RAW:", text);

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }

    let parsed: {
      company?: unknown;
      role?: unknown;
      requiredSkills?: unknown;
      niceToHaveSkills?: unknown;
      location?: unknown;
      seniority?: unknown;
    };

    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("JSON PARSE FAILED:", text);
      return res.json(fallbackParseJob(description));
    }

    const normalized = {
      company: typeof parsed.company === "string" ? parsed.company : "",
      role: typeof parsed.role === "string" ? parsed.role : "",
      requiredSkills: Array.isArray(parsed.requiredSkills)
        ? parsed.requiredSkills.map((value) => String(value))
        : [],
      niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills)
        ? parsed.niceToHaveSkills.map((value) => String(value))
        : [],
      location: typeof parsed.location === "string" ? parsed.location : "",
      seniority: typeof parsed.seniority === "string" ? parsed.seniority : ""
    };

    return res.json(normalized);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI ERROR:", error);
    return res.json(fallbackParseJob((req.body as { description?: string }).description || ""));
  }
};

export const resumeSuggestions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body as { description?: string; jobDescriptionText?: string };
    const description = body.description || body.jobDescriptionText;

    if (!description) {
      return res.status(400).json({ error: "No description provided" });
    }

    const apiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey || apiKey === "dummy_key") {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing or invalid" });
    }

    let response: unknown;
    try {
      const client = getClient();
      response = await client.responses.create({
        model: "gpt-4o-mini",
        input: `
Generate 3 to 5 strong resume bullet points tailored to the job description.

Return ONLY valid JSON in this exact format:
{
  "suggestions": ["bullet1", "bullet2", "bullet3"]
}

Job Description:
${description}
      `
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("AI ERROR (resume suggestions):", error);
      return res.json({ suggestions: fallbackResumeSuggestions(description) });
    }

    let text = extractResponseText(response);

    // eslint-disable-next-line no-console
    console.log("AI RAW RESUME SUGGESTIONS:", text);

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }

  
    let parsed: { suggestions?: unknown };
    try {
      parsed = JSON.parse(text) as { suggestions?: unknown };
    } catch {
      // eslint-disable-next-line no-console
      console.error("JSON PARSE FAILED (resume suggestions):", text);
      return res.json({ suggestions: fallbackResumeSuggestions(description) });
    }

    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .map((item) => String(item).replace(/^["'\-\s]+|["'\s]+$/g, "").trim())
          .filter(Boolean)
      : [];

    if (suggestions.length === 0) {
      return res.json({ suggestions: fallbackResumeSuggestions(description) });
    }

    return res.json({ suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI ERROR (resume suggestions):", error);
    return res.json({
      suggestions: fallbackResumeSuggestions((req.body as { description?: string }).description || "")
    });
  }
};

export const matchScore = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body as { description?: string; resume?: string };
    const description = body.description;
    const resume = body.resume;

    // eslint-disable-next-line no-console
    console.log("MATCH SCORE REQUEST:", {
      descriptionLength: description?.length || 0,
      resumeLength: resume?.length || 0,
      descriptionPreview: (description || "").slice(0, 160),
      resumePreview: (resume || "").slice(0, 160)
    });

    if (!description || !resume) {
      return res.status(400).json({ error: "description and resume are required" });
    }

    const apiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey || apiKey === "dummy_key") {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing or invalid" });
    }

    const client = getClient();
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
Compare this resume with the job description.

Return ONLY JSON:

{
  "matchScore": 0,
  "missingSkills": ["", ""],
  "matchedSkills": ["", ""],
  "summary": ""
}

Job Description:
${description}

Resume:
${resume}
      `
    });

    let text = extractResponseText(response);
    // eslint-disable-next-line no-console
    console.log("AI RAW MATCH SCORE:", text);

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }

    let parsed: {
      matchScore?: unknown;
      missingSkills?: unknown;
      matchedSkills?: unknown;
      summary?: unknown;
    };

    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("JSON PARSE FAILED (match score):", text);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const normalized = {
      matchScore:
        typeof parsed.matchScore === "number"
          ? Math.max(0, Math.min(100, Math.round(parsed.matchScore)))
          : 0,
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills.map((v) => String(v).trim()).filter(Boolean)
        : [],
      matchedSkills: Array.isArray(parsed.matchedSkills)
        ? parsed.matchedSkills.map((v) => String(v).trim()).filter(Boolean)
        : [],
      summary: typeof parsed.summary === "string" ? parsed.summary.trim() : ""
    };

    // eslint-disable-next-line no-console
    console.log("PARSED MATCH SCORE:", normalized);

    return res.json(normalized);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI ERROR (match score):", error);
    return res.status(500).json({ error: "Match score failed" });
  }
};

export default {
  parseJob,
  resumeSuggestions,
  matchScore
};
