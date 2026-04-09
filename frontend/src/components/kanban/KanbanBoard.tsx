import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";

import type { ApplicationStatus, JobApplication } from "../../types/application.types";
import { KANBAN_COLUMNS } from "../../types/application.types";
import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  applications: JobApplication[];
  onStatusChange: (id: string, nextStatus: ApplicationStatus) => void;
  onCardClick: (application: JobApplication) => void;
}

const KanbanBoard = ({ applications, onStatusChange, onCardClick }: KanbanBoardProps) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const grouped = KANBAN_COLUMNS.reduce<Record<ApplicationStatus, JobApplication[]>>(
    (accumulator, status) => {
      accumulator[status] = applications.filter((application) => application.status === status);
      return accumulator;
    },
    {
      Applied: [],
      "Phone Screen": [],
      Interview: [],
      Offer: [],
      Rejected: []
    }
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const currentStatus = active.data.current?.status as ApplicationStatus | undefined;
    const targetStatus = over.data.current?.status
      ? (over.data.current.status as ApplicationStatus)
      : (over.id as ApplicationStatus);

    if (!currentStatus || !targetStatus || currentStatus === targetStatus) return;

    onStatusChange(String(active.id), targetStatus);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            title={status}
            items={grouped[status]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
