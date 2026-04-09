import type { JobApplication } from "../types/application.types";

const escapeCsv = (value: unknown): string => {
  const str = String(value ?? "");
  // If it contains comma/quote/newline, wrap in quotes and escape quotes by doubling.
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatDate = (iso: string | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export const jobsToCsv = (jobs: JobApplication[]): string => {
  const header = ["Company", "Role", "Status", "Date", "Salary"].join(",");
  const rows = jobs.map((job) => {
    const company = escapeCsv(job.company);
    const role = escapeCsv(job.role);
    const status = escapeCsv(job.status);
    const date = escapeCsv(formatDate(job.dateApplied));
    const salary = escapeCsv(job.salaryRange || "");
    return [company, role, status, date, salary].join(",");
  });
  return [header, ...rows].join("\r\n");
};

export const downloadCsv = (csv: string, filename = "jobs.csv") => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

