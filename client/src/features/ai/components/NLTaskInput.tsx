import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function NLTaskInput() {
  return (
    <div className="flex gap-2">
      <Input placeholder="Describe a task in plain language" />
      <Button>Parse</Button>
    </div>
  );
}