import Link from "next/link";

import { Button } from "@/primitives/button";

export function HomepageContent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">ToolShare</h1>
        <p className="mb-6 text-gray-600">
          Share tools with your community and discover new ones
        </p>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button outline>Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
