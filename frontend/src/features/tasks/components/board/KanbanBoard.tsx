import { DragDropProvider } from "@dnd-kit/react";
import KanbanColumn from "./KanbanColumn";
import type { Task, TaskStatus } from "../../task.types";

interface KanbanBoardProps {
  tasks: Task[];

  onViewTask: (task: Task) => void;

  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const columns: {
  status: TaskStatus;
  label: string;
}[] = [
  {
    status: "to_do",
    label: "To do",
  },
  {
    status: "in_progress",
    label: "In progress",
  },
  {
    status: "done",
    label: "Done",
  },
];

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "to_do" || value === "in_progress" || value === "done";
}

export default function KanbanBoard({
  tasks,
  onViewTask,
  onStatusChange,
}: KanbanBoardProps) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) {
          return;
        }

        const { source, target } = event.operation;

        if (!source || !target || !isTaskStatus(target.id)) {
          return;
        }

        const task = tasks.find((item) => item.id === String(source.id));

        if (!task || task.status === target.id) {
          return;
        }

        onStatusChange(task, target.id);
      }}
    >
      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-max grid-cols-3 gap-4 xl:min-w-0">
          {columns.map(({ status, label }) => (
            <KanbanColumn
              key={status}
              status={status}
              label={label}
              tasks={tasks.filter((task) => task.status === status)}
              onViewTask={onViewTask}
            />
          ))}
        </div>
      </div>
    </DragDropProvider>
  );
}
