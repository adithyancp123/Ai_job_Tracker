import { KANBAN_COLUMNS } from "../types/application.types";
import type { ApplicationStatus } from "../types/application.types";

interface ApplicationFormFieldsProps {
  company: string;
  setCompany: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  jobDescriptionLink: string;
  setJobDescriptionLink: (value: string) => void;
  dateApplied: string;
  setDateApplied: (value: string) => void;
  status: ApplicationStatus;
  setStatus: (value: ApplicationStatus) => void;
  salaryRange: string;
  setSalaryRange: (value: string) => void;
  requiredSkills: string;
  setRequiredSkills: (value: string) => void;
  niceToHaveSkills: string;
  setNiceToHaveSkills: (value: string) => void;
  seniority: string;
  setSeniority: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

const ApplicationFormFields = ({
  company,
  setCompany,
  role,
  setRole,
  jobDescriptionLink,
  setJobDescriptionLink,
  dateApplied,
  setDateApplied,
  status,
  setStatus,
  salaryRange,
  setSalaryRange,
  requiredSkills,
  setRequiredSkills,
  niceToHaveSkills,
  setNiceToHaveSkills,
  seniority,
  setSeniority,
  location,
  setLocation,
  notes,
  setNotes
}: ApplicationFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        required
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Job Description Link (optional)"
        value={jobDescriptionLink}
        onChange={(e) => setJobDescriptionLink(e.target.value)}
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Date Applied"
        type="date"
        value={dateApplied}
        onChange={(e) => setDateApplied(e.target.value)}
        required
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 md:col-span-2"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        required
      />
      <select
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        value={status}
        onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
      >
        {KANBAN_COLUMNS.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Salary Range (optional)"
        value={salaryRange}
        onChange={(e) => setSalaryRange(e.target.value)}
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Required Skills (comma separated)"
        value={requiredSkills}
        onChange={(e) => setRequiredSkills(e.target.value)}
        required
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Nice to Have Skills (comma separated, optional)"
        value={niceToHaveSkills}
        onChange={(e) => setNiceToHaveSkills(e.target.value)}
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Seniority (optional)"
        value={seniority}
        onChange={(e) => setSeniority(e.target.value)}
      />
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
    </div>
  );
};

export default ApplicationFormFields;

