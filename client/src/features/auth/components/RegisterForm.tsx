import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../hooks/useAuth";

interface RegisterFormProps {
  onSwitch?: () => void;
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-focus">Create account</p>
        <h1 className="mt-1 font-display text-2xl font-medium">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">
          A few details and you&apos;re ready to go.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="register-name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <Input
          id="register-name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <Input
          id="register-password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
      {onSwitch && (
        <p className="text-sm text-ink/60 dark:text-paper/60">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="rounded font-medium text-focus hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  );
}