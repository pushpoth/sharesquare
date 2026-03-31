"use client";
// Implements: TASK-044 (REQ-001, REQ-027), TASK-015

import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading,
    supabaseAuthAvailable,
    signInWithGoogle,
    signInWithDemoProfile,
  } = useAuth();

  const handleDemoLogin = async () => {
    await signInWithDemoProfile({
      email: "demo@sharesquare.app",
      name: "Demo User",
      picture: "",
    });
    navigate(ROUTES.HOME);
  };

  const handleGoogleSignIn = () => {
    void signInWithGoogle().catch((err) => {
      console.error(err);
    });
  };

  if (isLoading) {
    return (
      <main
        data-testid="login-page"
        className="flex min-h-screen items-center justify-center bg-surface"
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-accent"
          aria-label="Loading"
        />
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <main
      data-testid="login-page"
      className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12"
    >
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-4xl font-bold text-text-on-primary">S</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary-dark">ShareSquare</h1>
        </div>

        {/* Tagline */}
        <p className="mb-10 text-lg text-text-secondary">
          Split expenses with friends, roommates, and family — effortlessly.
        </p>

        {/* Bullet points */}
        <ul className="mb-12 space-y-3 text-left text-text-primary">
          <li className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Track shared expenses
          </li>
          <li className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent" />
            See who owes whom
          </li>
          <li className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Settle up simply
          </li>
        </ul>

        {/* Buttons */}
        <div className="flex w-full flex-col gap-4">
          {supabaseAuthAvailable ? (
            <button
              type="button"
              data-testid="sign-in-google-button"
              onClick={handleGoogleSignIn}
              className="w-full rounded-xl bg-accent px-6 py-4 font-semibold text-text-on-primary shadow-md transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Sign in with Google
            </button>
          ) : (
            <p className="rounded-xl border border-primary-light bg-primary-light/30 px-4 py-3 text-center text-sm text-text-secondary">
              Set <code className="text-text-primary">VITE_SUPABASE_URL</code> and{" "}
              <code className="text-text-primary">VITE_SUPABASE_ANON_KEY</code> to your project (see
              README) to enable Google sign-in. Use Quick Start for local demo.
            </p>
          )}
          <button
            type="button"
            onClick={handleDemoLogin}
            data-testid="sign-in-button"
            className="w-full rounded-xl border-2 border-primary px-6 py-4 font-semibold text-primary transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Quick Start (Demo Mode)
          </button>
        </div>
      </div>
    </main>
  );
}
