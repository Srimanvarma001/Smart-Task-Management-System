import type { FormEvent } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function RegisterForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="font-display text-2xl">Create an account</h1>
      <Input placeholder="Name" required />
      <Input type="email" placeholder="Email" required />
      <Input type="password" placeholder="Password" required />
      <Button type="submit" className="w-full">
        Register
      </Button>
    </form>
  );
}