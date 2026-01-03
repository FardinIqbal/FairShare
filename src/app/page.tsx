import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-serif text-lg">F</span>
            </div>
            <span className="font-serif text-lg text-[var(--foreground)]">FairShare</span>
          </Link>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold)] font-medium mb-6">
            Expense Management, Refined
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl text-[var(--foreground)] mb-6 leading-[1.1]">
            Settle expenses
            <br />
            <span className="italic text-[var(--accent)]">with grace</span>
          </h1>

          <p className="text-lg text-[var(--foreground-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
            The refined approach to shared expenses. Track, split, and settle up
            with the elegance your friendships deserve.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-3.5 text-sm bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-all"
            >
              Begin your journey
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 text-sm text-[var(--foreground)] border border-[var(--border)] rounded-md hover:border-[var(--border-strong)] hover:bg-[var(--background-elevated)] transition-all"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="w-16 h-px bg-[var(--border)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
        <div className="w-16 h-px bg-[var(--border)]" />
      </div>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold)] font-medium mb-4">
              How It Works
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--foreground)]">
              Effortless by design
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8">
              <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-lg text-[var(--accent)]">I</span>
              </div>
              <h3 className="font-serif text-xl text-[var(--foreground)] mb-3">
                Record with ease
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Add expenses in moments. We handle the arithmetic so you can focus on what matters.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8">
              <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-lg text-[var(--accent)]">II</span>
              </div>
              <h3 className="font-serif text-xl text-[var(--foreground)] mb-3">
                Invite effortlessly
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Share a single link. Your companions join instantly—no complications, no friction.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8">
              <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-lg text-[var(--accent)]">III</span>
              </div>
              <h3 className="font-serif text-xl text-[var(--foreground)] mb-3">
                Settle gracefully
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Clear balances at a glance. We simplify debts to minimize transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Quote Section */}
      <section className="py-20 px-6 bg-[var(--background-warm)]">
        <div className="max-w-2xl mx-auto text-center">
          <svg className="w-8 h-8 text-[var(--gold)] mx-auto mb-6 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="font-serif text-2xl sm:text-3xl text-[var(--foreground)] italic leading-relaxed mb-8">
            The true measure of a friendship is not in how we share our triumphs,
            but in how gracefully we handle the small debts between us.
          </p>
          <div className="w-12 h-px bg-[var(--gold)] mx-auto" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-[var(--foreground)] mb-4">
            Ready to begin?
          </h2>
          <p className="text-[var(--foreground-secondary)] mb-8 leading-relaxed">
            Join those who believe that managing money among friends
            should be as refined as the friendships themselves.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-3.5 text-sm bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-all"
          >
            Create your first group
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-serif text-sm">F</span>
            </div>
            <span className="text-sm text-[var(--foreground-secondary)]">
              FairShare
            </span>
          </div>
          <p className="text-sm text-[var(--foreground-tertiary)]">
            Crafted with care
          </p>
        </div>
      </footer>
    </div>
  );
}
