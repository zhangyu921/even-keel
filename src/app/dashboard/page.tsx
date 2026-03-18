import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Dashboard coming soon. You&apos;re logged in as {session.user.email}.
        </p>
      </div>
    </div>
  );
}
