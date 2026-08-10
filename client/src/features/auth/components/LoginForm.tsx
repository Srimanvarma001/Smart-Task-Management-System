import type { FormEvent } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuthContext } from "../context/AuthContext";

export default function LoginForm() {
  const { login } = useAuthContext();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login({ id: "", name: "", email: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="font-display text-2xl">Sign in</h1>
      <Input type="email" placeholder="Email" required />
      <Input type="password" placeholder="Password" required />
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}