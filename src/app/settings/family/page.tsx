import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function FamilySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { family: { include: { members: true } } },
  });

  if (user?.family) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{user.family.name}</CardTitle>
          <CardDescription>
            {user.family.members.length} member{user.family.members.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-2">Invite code</p>
            <code className="block rounded bg-muted px-3 py-2 text-sm font-mono">
              {user.family.inviteCode}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Share this code with your partner to invite them
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Members</p>
            {user.family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span className="text-sm">{member.name}</span>
                <span className="text-xs text-muted-foreground">
                  {member.role === "ADMIN" ? "Admin" : "Member"}
                </span>
              </div>
            ))}
          </div>

          <Button asChild variant="outline" className="mt-2">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Family settings</CardTitle>
        <CardDescription>
          Create a new family or join an existing one with an invite code
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        <Button asChild size="lg">
          <Link href="/settings/family/create">Create a new family</Link>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button asChild variant="outline" size="lg">
          <Link href="/settings/family/join">Join with invite code</Link>
        </Button>

        <Button asChild variant="ghost" className="mt-2">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
