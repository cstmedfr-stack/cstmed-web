
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const adminLinks = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/offres", label: "Offres" },
  { href: "/admin/candidatures", label: "Candidatures" },
  { href: "/admin/conservation", label: "Conservation RGPD" },
  { href: "/admin/etablissements", label: "Demandes établissements" },
  { href: "/admin/partenaires", label: "Partenaires" },
  { href: "/admin/prospection", label: "Prospection & E-mails" },
  { href: "/admin/finances", label: "Factures & Paiements" },
  { href: "/admin/import", label: "France Travail" },
  { href: "/admin/mots-cles", label: "Mots-clés" },
] as const;

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/admin/login");
  }

  const { data: adminMembership, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (adminError || !adminMembership) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Accès administrateur refusé.");
  }

  return (
    <>
      <nav
        aria-label="Navigation de l'administration CSTMed"
        className="sticky top-0 z-[60] border-b border-[#cbdde2] bg-white/95 shadow-sm backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-8">
          <Link
            href="/admin"
            className="shrink-0 rounded-lg bg-[#082a43] px-3 py-2 text-sm font-black"
          >
            <span style={{ color: "#ffffff" }}>
              CSTMed Admin
            </span>
          </Link>

          {/* Meniu cu derulare orizontală pe ecrane mici */}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-[#f5f9fb] px-3 py-2 text-xs font-bold text-[#082a43] transition hover:border-[#118c87] hover:bg-[#e8f7f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#118c87] sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {children}
    </>
  );
}
