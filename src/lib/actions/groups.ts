"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name || name.trim().length === 0) {
    throw new Error("Group name is required");
  }

  // Ensure user exists in our DB
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
    create: {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
  });

  // Create the group with the user as admin
  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      members: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/groups/${group.id}`);
}

export async function getUserGroups() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
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
    orderBy: {
      updatedAt: "desc",
    },
  });

  return groups;
}

export async function joinGroupByInvite(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode },
    include: {
      members: {
        where: { userId: user.id },
      },
    },
  });

  if (!group) {
    throw new Error("Invalid invite code");
  }

  // Already a member
  if (group.members.length > 0) {
    redirect(`/groups/${group.id}`);
  }

  // Ensure user exists in our DB
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
    create: {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
  });

  // Add user to group
  await prisma.groupMember.create({
    data: {
      userId: user.id,
      groupId: group.id,
      role: "MEMBER",
    },
  });

  revalidatePath("/dashboard");
  redirect(`/groups/${group.id}`);
}
