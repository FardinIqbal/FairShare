import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const { error: errorMessage } = await searchParams;

  async function signUp(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      redirect("/sign-up?error=" + encodeURIComponent(error.message));
    }

    redirect("/dashboard");
  }

  async function signUpWithGoogle() {
    "use server";

    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      redirect("/sign-up?error=" + encodeURIComponent(error.message));
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
            Begin your journey.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Join a community that believes shared expenses should be managed with the same care as the friendships they represent.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span>Create groups in seconds</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span>Invite with a simple link</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span>Settle up effortlessly</span>
            </div>
          </div>
        </div>

        <p className="text-white/50 text-sm relative z-10">
          Always free. Always elegant.
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
            <h1 className="font-serif text-3xl text-[var(--foreground)] mb-2">Create your account</h1>
            <p className="text-[var(--foreground-secondary)]">Start managing expenses with elegance</p>
          </div>

          <div className="bg-[var(--background-elevated)] p-8 rounded-lg border border-[var(--border)] shadow-[var(--shadow-md)]">
            {errorMessage && (
              <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error)]/20 rounded-md text-[var(--error)] text-sm">
                {errorMessage}
              </div>
            )}

            <form action={signUpWithGoogle} className="mb-6">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md hover:border-[var(--border-strong)] transition-all text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
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

            <form action={signUp} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm text-[var(--foreground)] mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                />
              </div>
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
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-all"
              >
                Create account
              </button>
            </form>

            <p className="mt-6 text-center text-[var(--foreground-secondary)]">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[var(--foreground-tertiary)]">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline hover:text-[var(--foreground-secondary)]">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline hover:text-[var(--foreground-secondary)]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
