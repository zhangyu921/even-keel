import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { family: true },
  });

  if (!user?.family) {
    redirect("/family");
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Family: {user.family.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite code: <code className="rounded bg-muted px-1.5 py-0.5">{user.family.inviteCode}</code>
        </p>
        <p className="mt-4 text-muted-foreground">
          Dashboard coming soon. You&apos;re logged in as {session.user.email}.
        </p>
      </div>
    </div>
  );
}
