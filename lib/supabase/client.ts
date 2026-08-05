import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Lipsesc variabilele NEXT_PUBLIC_SUPABASE_URL sau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}