import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdmin() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return null;
  }

  const {
    data: isAdmin,
    error: adminError,
  } = await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    return null;
  }

  return {
    supabase,
    userId,
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(
      "/admin/login?error=Votre session a expiré ou l’accès administrateur est refusé.",
    );
  }

  return admin;
}