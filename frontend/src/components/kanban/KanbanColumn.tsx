import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import type { ApplicationStatus, JobApplication } from "../../types/application.types";
import ApplicationCard from "./ApplicationCard";

interface KanbanColumnProps {
  title: ApplicationStatus;
  items: JobApplication[];
  onCardClick: (application: JobApplication) => void;
  highlightQuery?: string;
}

const KanbanColumn = ({ title, items, onCardClick, highlightQuery }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: { type: "column", status: title }
  });

  return (
    <section className="flex min-h-[420px] w-[85vw] max-w-sm flex-col rounded-xl bg-slate-100 p-3 transition-colors duration-300 dark:bg-slate-900 sm:w-72">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 transition-colors duration-300 dark:bg-slate-800 dark:text-slate-300">
          {items.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-md p-1 ${
          isOver ? "bg-blue-100/60 dark:bg-blue-950/40" : ""
        }`}
      >
        <SortableContext items={items.map((item) => item._id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/50 p-6 text-center transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/40">
              <svg
                className="h-8 w-8 text-slate-400 dark:text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M8 7h8M8 11h8M9 3h6a2 2 0 0 1 2 2v16l-2-1-3 1-3-1-2 1V5a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-200">
                No applications here
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Drag a card into this column to update status.
              </p>
            </div>
          ) : (
            items.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                onClick={onCardClick}
                highlightQuery={highlightQuery}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
};

export default KanbanColumn;
