import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/axiosClient";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../hooks/useAuth";

interface LoginFormProps {
  onSwitch?: () => void;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to sign in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-focus">Sign in</p>
        <h1 className="mt-1 font-display text-2xl font-medium">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">
          Pick up right where you left off.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      {onSwitch && (
        <p className="text-sm text-ink/60 dark:text-paper/60">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="rounded font-medium text-focus hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Create one
          </button>
        </p>
      )}
    </form>
  );
}