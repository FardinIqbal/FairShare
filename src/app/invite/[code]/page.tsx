import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { joinGroupByInvite } from "@/lib/actions/groups";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Find the group
  const group = await prisma.group.findUnique({
    where: { inviteCode: code },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          expenses: true,
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  // If logged in, check if already a member
  if (user) {
    const isMember = group.members.some((m) => m.userId === user.id);
    if (isMember) {
      redirect(`/groups/${group.id}`);
    }
  }

  async function handleJoin() {
    "use server";
    await joinGroupByInvite(code);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-serif text-xl">F</span>
            </div>
            <span className="font-serif text-xl text-[var(--foreground)]">FairShare</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="bg-[var(--background-elevated)] rounded-lg border border-[var(--border)] shadow-[var(--shadow-md)] p-10 text-center">
          <div className="w-16 h-16 rounded-md bg-[var(--accent)] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-serif text-2xl">{group.name[0].toUpperCase()}</span>
          </div>

          <p className="text-sm uppercase tracking-[0.15em] text-[var(--gold)] mb-3">You&apos;ve been invited to join</p>

          <h1 className="font-serif text-2xl text-[var(--foreground)] mb-2">
            {group.name}
          </h1>

          {group.description && (
            <p className="text-[var(--foreground-secondary)] mb-6">{group.description}</p>
          )}

          <div className="inline-flex items-center gap-5 px-5 py-3 bg-[var(--background-warm)] rounded-md text-sm text-[var(--foreground-secondary)] mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{group.members.length} member{group.members.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="w-px h-4 bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{group._count.expenses} expense{group._count.expenses !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Decorative element */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-px bg-[var(--border)]" />
            <div className="w-1 h-1 rounded-full bg-[var(--gold)]" />
            <div className="w-8 h-px bg-[var(--border)]" />
          </div>

          {user ? (
            <form action={handleJoin}>
              <button
                type="submit"
                className="w-full px-6 py-3.5 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors"
              >
                Join Group
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <Link
                href={`/sign-up?next=/invite/${code}`}
                className="block w-full px-6 py-3.5 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors"
              >
                Sign up to join
              </Link>
              <Link
                href={`/sign-in?next=/invite/${code}`}
                className="block w-full px-6 py-3.5 text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded-md hover:border-[var(--border-strong)] transition-all"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[var(--foreground-tertiary)] mt-8">
          FairShare makes it easy to settle expenses with grace.
        </p>
      </div>
    </main>
  );
}
