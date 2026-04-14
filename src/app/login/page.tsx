"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    if (typeof window !== "undefined") window.location.href = "/profile";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      {/* Left Side: Brand Area */}
      <section className="hidden lg:flex lg:col-span-7 primary-gradient relative flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary font-bold">auto_awesome</span>
            </div>
            <span className="font-headline text-2xl font-extrabold tracking-tighter">Job Zinda</span>
          </div>
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="font-headline text-7xl font-extrabold tracking-tight leading-[1.05] mb-8">
            Elevate your{" "}
            <span className="text-[#7230E6] bg-white px-3 py-1 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              career
            </span>{" "}
            journey.
          </h1>
          <p className="text-xl text-white/90 leading-relaxed font-medium">
            Experience the next generation of professional curation. Where high-end editorial aesthetics meet
            high-performance job searching.
          </p>
        </div>
        <div className="relative z-10">
          <div className="glass-effect rounded-2xl p-6 shadow-[0_8px_24px_-4px_rgba(114,48,230,0.2)] border border-white/20 max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">work</span>
              </div>
              <div>
                <p className="font-headline font-bold text-white">Curated Opportunities</p>
                <p className="text-sm text-white/80">3 new matches for &quot;Senior UI Designer&quot;</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-2 bg-white/20 rounded-full w-full" />
              <div className="h-2 bg-white/20 rounded-full w-3/4" />
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="col-span-1 lg:col-span-5 bg-background flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 py-12">
        {/* Mobile Brand Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
          </div>
          <span className="font-headline text-xl font-extrabold tracking-tighter text-primary">Job Zinda</span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground font-medium">Please enter your credentials to continue.</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1" htmlFor="username">
                  Username
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-transparent rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-foreground placeholder:text-muted-foreground/60"
                    id="username"
                    placeholder="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
                  <a className="text-xs font-bold text-primary hover:text-primary/80 transition-colors" href="#">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-3.5 bg-secondary border border-transparent rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-foreground placeholder:text-muted-foreground/60"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center gap-3">
              <input
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-[#7230E6]"
                id="keep-signed-in"
                type="checkbox"
              />
              <label className="text-sm font-medium text-muted-foreground select-none" htmlFor="keep-signed-in">
                Keep me signed in
              </label>
            </div>

            {/* Login Button */}
            <button
              className="w-full primary-gradient text-white font-headline font-bold py-4 rounded-xl shadow-[0_8px_24px_-4px_rgba(114,48,230,0.25)] hover:shadow-[0_12px_32px_-4px_rgba(114,48,230,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Sign Up Link */}
          <p className="text-center text-sm font-medium text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a className="text-primary font-bold hover:underline decoration-2 underline-offset-4" href="#">
              Create an account
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 text-center">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
            &copy; 2025 Job Zinda &bull; Privacy Policy
          </p>
        </div>
      </section>
    </main>
  );
}
