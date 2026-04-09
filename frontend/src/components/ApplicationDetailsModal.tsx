import { useEffect, useState } from "react";

import applicationsService from "../services/applications.service";
import { getErrorMessage } from "../services/error";
import ApplicationFormFields from "./ApplicationFormFields";
import type {
  ApplicationStatus,
  JobApplication,
  UpdateJobApplicationPayload
} from "../types/application.types";

interface ApplicationDetailsModalProps {
  application: JobApplication | null;
  onClose: () => void;
  onUpdated: (application: JobApplication) => void;
  onDeleted: (applicationId: string) => void;
}

const toCsv = (values?: string[]): string => (values || []).join(", ");
const fromCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const ApplicationDetailsModal = ({
  application,
  onClose,
  onUpdated,
  onDeleted
}: ApplicationDetailsModalProps) => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [dateApplied, setDateApplied] = useState("");
  const [jobDescriptionLink, setJobDescriptionLink] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [niceToHaveSkills, setNiceToHaveSkills] = useState("");
  const [seniority, setSeniority] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!application) return;
    setCompany(application.company || "");
    setRole(application.role || "");
    setStatus(application.status || "Applied");
    setDateApplied((application.dateApplied || "").split("T")[0] || "");
    setJobDescriptionLink(application.jobDescriptionLink || "");
    setSalaryRange(application.salaryRange || "");
    setRequiredSkills(toCsv(application.requiredSkills));
    setNiceToHaveSkills(toCsv(application.niceToHaveSkills));
    setSeniority(application.seniority || "");
    setNotes(application.notes || "");
    setLocation(application.location || "");
    setErrorMessage("");
  }, [application]);

  if (!application) return null;

  const handleSave = async () => {
    setErrorMessage("");
    if (!company.trim() || !role.trim() || !dateApplied || !location.trim() || !notes.trim()) {
      setErrorMessage("Company, role, date, notes and location are required.");
      return;
    }

    const payload: UpdateJobApplicationPayload = {
      company: company.trim(),
      role: role.trim(),
      status,
      dateApplied,
      requiredSkills: fromCsv(requiredSkills),
      niceToHaveSkills: niceToHaveSkills.trim() ? fromCsv(niceToHaveSkills) : undefined,
      notes: notes.trim(),
      location: location.trim(),
      jobDescriptionLink: jobDescriptionLink.trim() || undefined,
      salaryRange: salaryRange.trim() || undefined,
      seniority: seniority.trim() || undefined
    };

    setSaving(true);
    try {
      const updated = await applicationsService.updateApplication(application._id, payload);
      onUpdated(updated);
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to save changes."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this application?");
    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");
    try {
      await applicationsService.deleteApplication(application._id);
      onDeleted(application._id);
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete application."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 transition-colors duration-300 dark:bg-black/70">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl transition-colors duration-300 dark:bg-slate-800 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Application Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            X
          </button>
        </div>

        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Click any field to edit, then save changes. Updates are applied instantly on the board.
          </p>

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
        </div>

        {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-red-700 disabled:opacity-70"
            disabled={deleting || saving}
          >
            {deleting ? "Deleting..." : "Delete Application"}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-emerald-700 disabled:opacity-70"
            disabled={saving || deleting}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
