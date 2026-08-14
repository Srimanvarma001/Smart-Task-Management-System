import { useState } from "react";
import AuthBrandPanel from "../features/auth/components/AuthBrandPanel";
import LoginForm from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <main className="flex min-h-screen">
      <AuthBrandPanel />
      <section className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-8 lg:w-[45%] lg:p-16">
        <div className="w-full max-w-sm rounded-lg border border-ink/20 bg-paper p-8 shadow-lg dark:border-paper/20 dark:bg-ink">
          {showRegister ? (
            <RegisterForm onSwitch={() => setShowRegister(false)} />
          ) : (
            <LoginForm onSwitch={() => setShowRegister(true)} />
          )}
        </div>
      </section>
    </main>
  );
}
