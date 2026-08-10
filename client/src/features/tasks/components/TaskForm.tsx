import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function TaskForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Task title" />
      <Button type="submit">Add task</Button>
    </form>
  );
}