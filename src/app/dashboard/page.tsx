import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserGroups } from "@/lib/actions/groups";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const groups = await getUserGroups();
  const firstName = user.user_metadata?.name?.split(' ')[0] || 'there';

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
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

          <div className="flex items-center gap-5">
            <ThemeToggle />
            <span className="text-sm text-[var(--foreground-secondary)]">
              {user.user_metadata?.name || user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.15em] text-[var(--gold)] mb-2">Dashboard</p>
          <h1 className="font-serif text-3xl text-[var(--foreground)]">
            Good day, {firstName}
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-6">
            <p className="text-sm text-[var(--foreground-secondary)] mb-2">You are owed</p>
            <p className="font-serif text-2xl text-[var(--success)]">$0.00</p>
          </div>

          <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-6">
            <p className="text-sm text-[var(--foreground-secondary)] mb-2">You owe</p>
            <p className="font-serif text-2xl text-[var(--error)]">$0.00</p>
          </div>

          <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-6">
            <p className="text-sm text-[var(--foreground-secondary)] mb-2">Active groups</p>
            <p className="font-serif text-2xl text-[var(--foreground)]">{groups.length}</p>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Groups Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-xl text-[var(--foreground)]">Your Groups</h2>
          <Link
            href="/groups/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-md hover:bg-[var(--accent-hover)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
            </svg>
            New Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-16 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--accent)] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-[var(--foreground)] mb-2">
              No groups yet
            </h3>
            <p className="text-[var(--foreground-secondary)] mb-8 max-w-sm mx-auto">
              Create your first group to begin tracking shared expenses with friends and family.
            </p>
            <Link
              href="/groups/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors"
            >
              Create your first group
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] p-6 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-md bg-[var(--accent)] flex items-center justify-center">
                    <span className="text-white font-serif text-xl">
                      {group.name[0].toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-[var(--foreground-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <h3 className="font-serif text-lg text-[var(--foreground)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-[var(--foreground-secondary)] text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-[var(--border)] text-sm text-[var(--foreground-tertiary)]">
                  <span>{group.members.length} members</span>
                  <span>{group._count.expenses} expenses</span>
                </div>
              </Link>
            ))}

            {/* Add Group Card */}
            <Link
              href="/groups/new"
              className="group bg-[var(--background-warm)] rounded-lg border border-dashed border-[var(--border)] p-6 hover:border-[var(--accent)] transition-all flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] flex items-center justify-center mb-4 transition-all">
                <svg className="w-6 h-6 text-[var(--foreground-tertiary)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
                </svg>
              </div>
              <span className="text-sm text-[var(--foreground-secondary)] group-hover:text-[var(--accent)] transition-colors">
                Create new group
              </span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
