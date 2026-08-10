import type { Task } from "../types";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task._id}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}