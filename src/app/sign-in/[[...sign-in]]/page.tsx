import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { error: errorMessage } = await searchParams;
  async function signIn(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect("/sign-in?error=" + encodeURIComponent(error.message));
    }

    redirect("/dashboard");
  }

  async function signInWithGitHub() {
    "use server";

    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      redirect("/sign-in?error=" + encodeURIComponent(error.message));
    }

    if (data.url) {
      redirect(data.url);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--accent)] p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">
            <span className="text-white font-serif text-xl">F</span>
          </div>
          <span className="text-xl font-serif text-white">FairShare</span>
        </Link>

        <div className="space-y-8 relative z-10">
          <h1 className="font-serif text-4xl text-white leading-tight">
            Welcome back.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Continue managing your shared expenses with the elegance and simplicity you&apos;ve come to expect.
          </p>
          <div className="w-16 h-px bg-[var(--gold)]" />
        </div>

        <p className="text-white/50 text-sm relative z-10">
          Trusted by discerning groups worldwide
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between mb-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-serif text-lg">F</span>
              </div>
              <span className="font-serif text-lg text-[var(--foreground)]">FairShare</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Desktop theme toggle */}
          <div className="hidden lg:flex justify-end mb-6">
            <ThemeToggle />
          </div>

          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl text-[var(--foreground)] mb-2">Sign in</h1>
            <p className="text-[var(--foreground-secondary)]">Enter your credentials to continue</p>
          </div>

          <div className="bg-[var(--background-elevated)] p-8 rounded-lg border border-[var(--border)] shadow-[var(--shadow-md)]">
            {errorMessage && (
              <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error)]/20 rounded-md text-[var(--error)] text-sm">
                {errorMessage}
              </div>
            )}

            <form action={signInWithGitHub} className="mb-6">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md hover:border-[var(--border-strong)] transition-all text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[var(--background-elevated)] text-sm text-[var(--foreground-tertiary)]">or</span>
              </div>
            </div>

            <form action={signIn} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm text-[var(--foreground)] mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm text-[var(--foreground)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-all"
              >
                Sign in
              </button>
            </form>

            <p className="mt-6 text-center text-[var(--foreground-secondary)]">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
