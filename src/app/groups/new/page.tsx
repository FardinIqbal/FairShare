import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createGroup } from "@/lib/actions/groups";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function NewGroup() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-serif text-lg">F</span>
            </div>
            <span className="font-serif text-lg text-[var(--foreground)]">FairShare</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.15em] text-[var(--gold)] mb-2">New Group</p>
          <h1 className="font-serif text-3xl text-[var(--foreground)]">Create a group</h1>
        </div>

        <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-8">
          <form action={createGroup} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm text-[var(--foreground)] mb-2">
                Group name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g., Roommates, Summer Trip"
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm text-[var(--foreground)] mb-2">
                Description <span className="text-[var(--foreground-tertiary)]">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="What's this group for?"
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] transition-all resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href="/dashboard"
                className="flex-1 px-4 py-3 text-center text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded-md hover:border-[var(--border-strong)] transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
