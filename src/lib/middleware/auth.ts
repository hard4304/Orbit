import { auth } from "@/lib/auth";

export async function getAuthUser(): Promise<{ id: string; name: string; email: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as { id: string; name: string; email: string };
}

export async function requireAuth(): Promise<{ id: string; name: string; email: string }> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<{ id: string; name: string; email: string }> {
  const user = await requireAuth();
  if (user.name !== "hard4304") throw new Error("Forbidden");
  return user;
}


// maintain a config file for admins and read the requireAdmin from there
