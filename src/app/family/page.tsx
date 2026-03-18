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

export default async function FamilySetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { family: true },
  });

  if (user?.family) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Set up your family</CardTitle>
        <CardDescription>
          Create a new family or join an existing one with an invite code
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        <Button asChild size="lg">
          <Link href="/family/create">Create a new family</Link>
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
          <Link href="/family/join">Join with invite code</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
