"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function loginError(message: string): never {
  redirect(`/admin/login?error=${encodeURIComponent(message)}`);
}

export async function loginAdmin(formData: FormData) {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  const email =
    typeof emailValue === "string" ? emailValue.trim() : "";

  const password =
    typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    loginError("Introdu adresa de e-mail și parola.");
  }

  const supabase = await createClient();

  const { error: loginErrorResult } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (loginErrorResult) {
    loginError("Adresa de e-mail sau parola nu este corectă.");
  }

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    await supabase.auth.signOut();
    loginError("Sesiunea nu a putut fi verificată.");
  }

  const { data: adminMembership, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (adminError || !adminMembership) {
    await supabase.auth.signOut();
    loginError("Acest cont nu are drepturi de administrator CSTMed.");
  }

  redirect("/admin/offres");
}

export async function logoutAdmin() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/admin/login");
}