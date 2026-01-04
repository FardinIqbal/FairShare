import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
