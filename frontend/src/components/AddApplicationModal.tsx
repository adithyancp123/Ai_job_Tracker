import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import aiService from "../services/ai.service";
import applicationsService from "../services/applications.service";
import ApplicationFormFields from "./ApplicationFormFields";
import { getErrorMessage } from "../services/error";
import type {
  ApplicationStatus,
  CreateJobApplicationPayload,
  JobApplication
} from "../types/application.types";

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (application: JobApplication) => void;
  onToast?: (message: string) => void;
}

const toArray = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const AddApplicationModal = ({ isOpen, onClose, onCreated, onToast }: AddApplicationModalProps) => {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescriptionLink, setJobDescriptionLink] = useState("");
  const [notes, setNotes] = useState("");
  const [dateApplied, setDateApplied] = useState(today);
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [salaryRange, setSalaryRange] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [niceToHaveSkills, setNiceToHaveSkills] = useState("");
  const [seniority, setSeniority] = useState("");
  const [location, setLocation] = useState("");

  const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleParseWithAI = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!jobDescriptionText.trim()) {
      setErrorMessage("Please paste a job description first.");
      return;
    }

    setLoadingParse(true);
    try {
      const description = jobDescriptionText;
      const res = await fetch("http://localhost:5000/api/ai/parse-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ description })
      });

      const data = (await res.json()) as {
        company?: string;
        role?: string;
        requiredSkills?: string[];
        niceToHaveSkills?: string[];
        location?: string;
        seniority?: string;
        error?: string;
      };

      // eslint-disable-next-line no-console
      console.log("AI RESULT:", data);

      if (!res.ok) {
        throw new Error(data.error || "AI parsing failed");
      }

      setCompany(data.company || "");
      setRole(data.role || "");
      setRequiredSkills(data.requiredSkills?.join(", ") || "");
      setNiceToHaveSkills(data.niceToHaveSkills?.join(", ") || "");
      setLocation(data.location || "");
      setSeniority(data.seniority || "");
      setSuccessMessage("Fields autofilled from AI.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to parse job description. Please try again.");
      setErrorMessage(message);
      onToast?.(message);
      alert("AI parsing failed");
    } finally {
      setLoadingParse(false);
    }
  };

  const handleGetResumeSuggestions = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!jobDescriptionText.trim()) {
      setErrorMessage("Please paste a job description first.");
      return;
    }

    setLoadingSuggestions(true);
    try {
      const suggestions = await aiService.getResumeSuggestions(jobDescriptionText);
      setResumeSuggestions(suggestions);
      setSuccessMessage("Resume suggestions generated.");
    } catch {
      setErrorMessage("Failed to generate resume suggestions. Please try again.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCopySuggestion = async (suggestion: string, index: number) => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1400);
    } catch {
      setErrorMessage("Clipboard access failed. Please copy manually.");
    }
  };

  const handleCreateApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    if (!company.trim() || !role.trim() || !notes.trim()) {
      setErrorMessage("Company, role and notes are required.");
      return;
    }
    if (!dateApplied || Number.isNaN(new Date(dateApplied).getTime())) {
      setErrorMessage("Please provide a valid application date.");
      return;
    }
    if (!requiredSkills.trim() || !location.trim()) {
      setErrorMessage("Required skills and location are required.");
      return;
    }

    setLoadingSave(true);

    const payload: CreateJobApplicationPayload = {
      company: company.trim(),
      role: role.trim(),
      jobDescriptionLink: jobDescriptionLink.trim() || undefined,
      notes: notes.trim(),
      dateApplied,
      status,
      salaryRange: salaryRange.trim() || undefined,
      requiredSkills: toArray(requiredSkills),
      niceToHaveSkills: niceToHaveSkills.trim() ? toArray(niceToHaveSkills) : undefined,
      seniority: seniority.trim() || undefined,
      location: location.trim()
    };

    try {
      const created = await applicationsService.createApplication(payload);
      onCreated(created);
      onClose();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to create application. Check required fields and try again.")
      );
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-3 py-4 transition-colors duration-300 dark:bg-black/70 sm:px-4 sm:py-8">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl transition-colors duration-300 dark:bg-slate-800 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Application</h2>
          <button
            className="text-sm text-slate-500 transition-colors duration-300 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Paste Job Description
          </label>
          <textarea
            className="mt-2 h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
            value={jobDescriptionText}
            onChange={(event) => setJobDescriptionText(event.target.value)}
            placeholder="Paste the full job description text..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700 disabled:opacity-70"
              type="button"
              onClick={handleParseWithAI}
              disabled={loadingParse}
            >
              {loadingParse ? "Parsing..." : "Parse with AI"}
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-indigo-700 disabled:opacity-70"
              type="button"
              onClick={handleGetResumeSuggestions}
              disabled={loadingSuggestions}
            >
              {loadingSuggestions ? "Generating..." : "Get Resume Suggestions"}
            </button>
          </div>
        </div>

        {resumeSuggestions.length > 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 p-4 transition-colors duration-300 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Resume Suggestions
            </h3>
            <ul className="mt-3 space-y-2">
              {resumeSuggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-md bg-slate-50 p-3 transition-colors duration-300 dark:bg-slate-900"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-200">- {suggestion}</span>
                  <button
                    type="button"
                    onClick={() => void handleCopySuggestion(suggestion, index)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 transition-colors duration-300 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {copiedIndex === index ? "Copied" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">{successMessage}</p> : null}

        <form className="mt-5" onSubmit={handleCreateApplication}>
          <ApplicationFormFields
            company={company}
            setCompany={setCompany}
            role={role}
            setRole={setRole}
            jobDescriptionLink={jobDescriptionLink}
            setJobDescriptionLink={setJobDescriptionLink}
            dateApplied={dateApplied}
            setDateApplied={setDateApplied}
            status={status}
            setStatus={setStatus}
            salaryRange={salaryRange}
            setSalaryRange={setSalaryRange}
            requiredSkills={requiredSkills}
            setRequiredSkills={setRequiredSkills}
            niceToHaveSkills={niceToHaveSkills}
            setNiceToHaveSkills={setNiceToHaveSkills}
            seniority={seniority}
            setSeniority={setSeniority}
            location={location}
            setLocation={setLocation}
            notes={notes}
            setNotes={setNotes}
          />

          <div className="mt-3">
            <button
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors duration-300 hover:bg-emerald-700 disabled:opacity-70"
              type="submit"
              disabled={loadingSave}
            >
              {loadingSave ? "Saving..." : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplicationModal;
