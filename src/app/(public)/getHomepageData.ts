import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/common/supabase/server";

export async function getHomepageData() {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error:", error);
    // Continue to show homepage for unauthenticated users
    return { user: null };
  }

  if (user) {
    // Redirect authenticated users to dashboard
    redirect("/dashboard");
  }

  return { user: null };
}
