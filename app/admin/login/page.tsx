import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAdmin } from "../actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (userId) {
    const { data: adminMembership } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminMembership) {
      redirect("/admin/offres");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#061f33] via-[#0b3a59] to-[#118c87] px-5 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
        <div className="border-b border-slate-100 px-7 py-7 text-center sm:px-10">
          <Link href="/" className="inline-flex">
            <Image
              src="/images/cstmed-logo.jpg"
              alt="CSTMed"
              width={240}
              height={80}
              priority
              className="h-auto w-[220px] object-contain"
            />
          </Link>

          <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
            Administration
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#082a43]">
            Connexion à votre espace
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Accès réservé à l’administrateur CSTMed.
          </p>
        </div>

        <div className="px-7 py-8 sm:px-10">
          {error ? (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          ) : null}

          <form action={loginAdmin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#082a43]"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                placeholder="votre@email.fr"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#082a43]"
              >
                Mot de passe
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-[#102435] outline-none transition focus:border-[#118c87] focus:ring-4 focus:ring-[#118c87]/10"
                placeholder="Votre mot de passe"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#118c87] px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#0c7773]"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-[#118c87] hover:text-[#0c7773]"
            >
              ← Retour au site CSTMed
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}