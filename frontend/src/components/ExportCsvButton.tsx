import { downloadCsv, jobsToCsv } from "../utils/csv";
import type { JobApplication } from "../types/application.types";

interface ExportCsvButtonProps {
  jobs: JobApplication[];
  filename?: string;
  className?: string;
}

const ExportCsvButton = ({ jobs, filename = "jobs.csv", className }: ExportCsvButtonProps) => {
  const handleExport = () => {
    const csv = jobsToCsv(jobs);
    downloadCsv(csv, filename);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className={
        className ||
        "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
      }
      title="Download all jobs as CSV"
    >
      Export CSV
    </button>
  );
};

export default ExportCsvButton;

