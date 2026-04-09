import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useMemo } from "react";
import type { JobApplication } from "../../types/application.types";

interface ApplicationCardProps {
  application: JobApplication;
  onClick: (application: JobApplication) => void;
  highlightQuery?: string;
}

const statusBadgeClass: Record<JobApplication["status"], string> = {
  Applied:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600",
  "Phone Screen":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900/60",
  Interview:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/35 dark:text-amber-200 dark:border-amber-900/60",
  Offer:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-200 dark:border-emerald-900/60",
  Rejected:
    "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/35 dark:text-rose-200 dark:border-rose-900/60"
};

const ApplicationCard = ({ application, onClick, highlightQuery }: ApplicationCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application._id,
    data: {
      type: "application",
      status: application.status
    }
  });

  const query = useMemo(() => (highlightQuery || "").trim(), [highlightQuery]);
  const highlight = (value: string) => {
    if (!query) return value;
    const lower = value.toLowerCase();
    const q = query.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return value;

    const before = value.slice(0, idx);
    const match = value.slice(idx, idx + query.length);
    const after = value.slice(idx + query.length);
    return (
      <>
        {before}
        <mark className="rounded bg-yellow-200 px-0.5 text-slate-900 dark:bg-yellow-400/30 dark:text-slate-100">
          {match}
        </mark>
        {after}
      </>
    );
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const appliedDate = new Date(application.dateApplied);
  const formattedDate = Number.isNaN(appliedDate.getTime())
    ? "Date unavailable"
    : appliedDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const referenceDate = new Date(application.lastUpdatedDate || application.dateApplied);
  const msSinceReference = Number.isNaN(referenceDate.getTime())
    ? 0
    : Date.now() - referenceDate.getTime();
  const daysSinceReference = Math.floor(msSinceReference / (1000 * 60 * 60 * 24));
  const followUpNeeded = daysSinceReference >= 7 && application.status !== "Rejected";

  return (
    <article
      ref={setNodeRef}
      style={style}
      title={followUpNeeded ? "Follow up recommended" : undefined}
      className={`rounded-lg border bg-white p-3 shadow-sm transition-colors duration-300 dark:bg-slate-800 ${
        followUpNeeded
          ? "border-rose-400 ring-1 ring-rose-200 dark:border-rose-500 dark:ring-rose-950/60"
          : "border-slate-200 dark:border-slate-700"
      } ${
        isDragging ? "opacity-70" : ""
      }`}
      onClick={() => onClick(application)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            {highlight(application.company)}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">
            {highlight(application.role)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {followUpNeeded ? (
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 transition-colors duration-300 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-200">
              Follow up needed
            </span>
          ) : null}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass[application.status]}`}
          >
            {application.status}
          </span>
          <button
            type="button"
            className="cursor-grab rounded px-1 text-xs text-slate-500 transition-colors duration-300 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            aria-label="Drag application card"
          >
            ::
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Applied on: {formattedDate}</p>
    </article>
  );
};

export default ApplicationCard;
