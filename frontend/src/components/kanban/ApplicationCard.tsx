import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { JobApplication } from "../../types/application.types";

interface ApplicationCardProps {
  application: JobApplication;
  onClick: (application: JobApplication) => void;
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

const ApplicationCard = ({ application, onClick }: ApplicationCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application._id,
    data: {
      type: "application",
      status: application.status
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const parsedDate = new Date(application.dateApplied);
  const formattedDate = Number.isNaN(parsedDate.getTime())
    ? "Date unavailable"
    : parsedDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800 ${
        isDragging ? "opacity-70" : ""
      }`}
      onClick={() => onClick(application)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            {application.company}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">
            {application.role}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
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
