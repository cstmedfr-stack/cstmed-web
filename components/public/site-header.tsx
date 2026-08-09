import Image from "next/image";
import Link from "next/link";

import { FloatingWhatsApp } from "@/components/public/floating-whatsapp";
import { HeaderLanguageSwitcher } from "@/components/public/header-language-switcher";

import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

import { publicLinks } from "@/lib/site/public-links";

type SiteHeaderProps = {
  locale: Locale;
  labels: Dictionary["common"];
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.8a2 2 0 0 1-.45 2.11L8.07 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.84.55 2.8.68A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M13.5 22v-9h3l.45-3.5H13.5V7.3c0-1.01.28-1.7 1.74-1.7H17.1V2.48c-.32-.04-1.43-.14-2.72-.14-2.69 0-4.53 1.64-4.53 4.66v2.5H6.8V13h3.05v9h3.65Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.3"
        cy="6.7"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4 transition group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

export function SiteHeader({
  locale,
}: SiteHeaderProps) {
  const content =
    locale === "ro"
      ? {
          tagline:
            "Recrutare medicală • Franța – Europa",

          search:
            "Caută oferte",

          home:
            "Acasă",

          doctors:
            "Medici",

          establishments:
            "Unități medicale",

          about:
            "Cine suntem?",

          contact:
            "Contact",

          menu:
            "Meniu",

          doctorMenu: [
            {
              label:
                "Oferte de muncă",
              href:
                `/${locale}/offres`,
            },
            {
              label:
                "Pregătește-ți proiectul",
              href:
                `/${locale}#projet-medical`,
            },
            {
              label:
                "Specialități medicale",
              href:
                `/${locale}#specialites`,
            },
            {
              label:
                "Însoțire și instalare în Franța",
              href:
                `/${locale}#accompagnement-medecins`,
            },
            {
              label:
                "Demersuri administrative",
              href:
                `/${locale}#demarches-administratives`,
            },
            {
              label:
                "Trimite CV-ul",
              href:
                `/${locale}/candidature`,
            },
          ],

          aboutMenu: [
            {
              label:
                "Cine suntem?",
              href:
                `/${locale}#qui-sommes-nous`,
            },
            {
              label:
                "Expertiza noastră",
              href:
                `/${locale}#expertise`,
            },
            {
              label:
                "Metoda noastră",
              href:
                `/${locale}#methode-cstmed`,
            },
          ],
        }
      : {
          tagline:
            "Recrutement médical • France – Europe",

          search:
            "Recherche d’offres",

          home:
            "Accueil",

          doctors:
            "Médecins",

          establishments:
            "Établissements",

          about:
            "Qui sommes-nous ?",

          contact:
            "Contact",

          menu:
            "Menu",

          doctorMenu: [
            {
              label:
                "Offres d’emploi",
              href:
                `/${locale}/offres`,
            },
            {
              label:
                "Préparer votre projet",
              href:
                `/${locale}#projet-medical`,
            },
            {
              label:
                "Spécialités médicales",
              href:
                `/${locale}#specialites`,
            },
            {
              label:
                "Accompagnement & installation",
              href:
                `/${locale}#accompagnement-medecins`,
            },
            {
              label:
                "Démarches administratives",
              href:
                `/${locale}#demarches-administratives`,
            },
            {
              label:
                "Envoyer mon CV",
              href:
                `/${locale}/candidature`,
            },
          ],

          aboutMenu: [
            {
              label:
                "Qui sommes-nous ?",
              href:
                `/${locale}#qui-sommes-nous`,
            },
            {
              label:
                "Notre expertise",
              href:
                `/${locale}#expertise`,
            },
            {
              label:
                "Notre méthode",
              href:
                `/${locale}#methode-cstmed`,
            },
          ],
        };

  return (
    <>
      {/* BARA DE SUS — NU ESTE STICKY */}
      <div className="relative z-[60] bg-[#082a43] text-white">
        <div className="mx-auto flex min-h-9 max-w-[1450px] items-center justify-between gap-4 px-5 py-1.5 text-[11px] sm:px-8">
          <p className="font-semibold text-slate-200">
            {content.tagline}
          </p>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2">
              {publicLinks.facebook ? (
                <a
                  href={publicLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook CSTMed"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition hover:border-[#65d9ce] hover:bg-[#65d9ce] hover:text-[#082a43]"
                >
                  <FacebookIcon />
                </a>
              ) : null}

              {publicLinks.instagram ? (
                <a
                  href={publicLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram CSTMed"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition hover:border-[#65d9ce] hover:bg-[#65d9ce] hover:text-[#082a43]"
                >
                  <InstagramIcon />
                </a>
              ) : null}
            </div>

            <a
              href={`tel:${publicLinks.phoneRomaniaHref}`}
              className="flex items-center gap-1.5 font-semibold transition hover:text-[#65d9ce]"
            >
              <PhoneIcon />

              <span className="font-black text-[#65d9ce]">
                RO
              </span>

              {publicLinks.phoneRomaniaDisplay}
            </a>

            <a
              href={`tel:${publicLinks.phoneHref}`}
              className="flex items-center gap-1.5 font-semibold transition hover:text-[#65d9ce]"
            >
              <PhoneIcon />

              <span className="font-black text-[#65d9ce]">
                FR
              </span>

              {publicLinks.phoneDisplay}
            </a>

            <a
              href={`mailto:${publicLinks.email}`}
              className="flex items-center gap-1.5 font-semibold transition hover:text-[#65d9ce]"
            >
              <MailIcon />

              {publicLinks.email}
            </a>
          </div>
        </div>
      </div>

      {/* PARTEA CARE RĂMÂNE PERMANENT VIZIBILĂ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-md backdrop-blur-xl">
        {/* DESKTOP / TABLETĂ */}
        <div className="mx-auto flex min-h-[92px] max-w-[1450px] items-center gap-4 px-5 sm:px-8 lg:min-h-[88px]">
          {/* LOGO */}
          <Link
            href={`/${locale}`}
            aria-label="CSTMed"
            className="shrink-0"
          >
            <Image
              src="/images/cstmed-logo.png"
              alt="CSTMed"
              width={420}
              height={140}
              priority
              className="h-auto w-[145px] object-contain sm:w-[165px] xl:w-[175px]"
            />
          </Link>

          {/* RECHERCHE D'OFFRES */}
          <Link
            href={`/${locale}/offres`}
            className="hidden min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#0D6EFD] px-5 py-3 text-[11px] font-black uppercase tracking-[0.03em] text-[#082A43] shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0B63E5] md:inline-flex xl:min-w-[220px]"
          >
            <SearchIcon />

            {content.search}
          </Link>

          {/* NAVIGAȚIE DESKTOP */}
          <nav
            aria-label={content.menu}
            className="ml-auto hidden items-center gap-1 lg:flex"
          >
            <Link
              href={`/${locale}`}
              className="whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-black text-slate-700 transition hover:bg-slate-100 hover:text-[#0965d8]"
            >
              {content.home}
            </Link>

            {/* MÉDECINS */}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-black text-slate-700 transition hover:bg-slate-100 hover:text-[#0965d8]">
                {content.doctors}

                <ChevronDown />
              </summary>

              <div className="absolute left-0 top-[calc(100%+10px)] w-[290px] overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-2xl">
                <div className="px-3 pb-2 pt-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#118c87]">
                    {locale === "ro"
                      ? "Pentru medici"
                      : "Pour les médecins"}
                  </p>
                </div>

                {content.doctorMenu.map(
                  (item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#f5f9fb] hover:text-[#0965d8]"
                    >
                      {item.label}

                      <span
                        aria-hidden="true"
                        className="text-slate-300"
                      >
                        →
                      </span>
                    </Link>
                  ),
                )}

                <div className="mt-2 rounded-xl bg-[#e5f7f5] px-3 py-3 text-xs font-black leading-5 text-[#0c7773]">
                  {locale === "ro"
                    ? "✓ Servicii CSTMed 100% gratuite pentru medici"
                    : "✓ Services CSTMed 100 % gratuits pour les médecins"}
                </div>
              </div>
            </details>

            {/* ÉTABLISSEMENTS */}
            <Link
              href={`/${locale}/etablissements`}
              className="whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-black text-slate-700 transition hover:bg-slate-100 hover:text-[#0965d8]"
            >
              {content.establishments}
            </Link>

            {/* QUI SOMMES-NOUS */}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-black text-slate-700 transition hover:bg-slate-100 hover:text-[#0965d8]">
                {content.about}

                <ChevronDown />
              </summary>

              <div className="absolute right-0 top-[calc(100%+10px)] w-[260px] overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-2xl">
                {content.aboutMenu.map(
                  (item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#f5f9fb] hover:text-[#0965d8]"
                    >
                      {item.label}

                      <span
                        aria-hidden="true"
                        className="text-slate-300"
                      >
                        →
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </details>

            <Link
              href={`/${locale}#contact`}
              className="whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-black text-slate-700 transition hover:bg-slate-100 hover:text-[#0965d8]"
            >
              {content.contact}
            </Link>
          </nav>

          {/* LIMBĂ */}
          <div className="ml-auto shrink-0 lg:ml-2">
            <HeaderLanguageSwitcher
              locale={locale}
            />
          </div>
        </div>

        {/* RECHERCHE D'OFFRES PE MOBIL */}
        <div className="px-5 pb-3 md:hidden sm:px-8">
          <Link
            href={`/${locale}/offres`}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#0D6EFD] px-6 py-3 text-[11px] font-black uppercase tracking-[0.03em] text-[#082A43] shadow-lg"
          >
            <SearchIcon />

            {content.search}
          </Link>
        </div>

        {/* MENIU MOBIL */}
        <div className="border-t border-slate-200 lg:hidden">
          <div className="px-5 sm:px-8">
            <details className="group">
              <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between text-sm font-black text-[#082a43]">
                <span>
                  {content.menu}
                </span>

                <span className="text-xl transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="border-t border-slate-100 pb-5 pt-3">
                <Link
                  href={`/${locale}`}
                  className="block rounded-xl px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100"
                >
                  {content.home}
                </Link>

                {/* MOBILE MÉDECINS */}
                <div className="mt-2 rounded-[1.3rem] bg-[#f5f9fb] p-2">
                  <p className="px-3 pb-2 pt-2 text-xs font-black uppercase tracking-[0.14em] text-[#118c87]">
                    {content.doctors}
                  </p>

                  {content.doctorMenu.map(
                    (item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-white hover:text-[#0965d8]"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}

                  <p className="mx-2 mt-2 rounded-xl bg-[#e5f7f5] px-3 py-2.5 text-xs font-black leading-5 text-[#0c7773]">
                    {locale === "ro"
                      ? "✓ 100% gratuit pentru medici"
                      : "✓ 100 % gratuit pour les médecins"}
                  </p>
                </div>

                <Link
                  href={`/${locale}/etablissements`}
                  className="mt-2 block rounded-xl px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100"
                >
                  {content.establishments}
                </Link>

                {/* MOBILE QUI SOMMES-NOUS */}
                <div className="mt-2 rounded-[1.3rem] bg-[#f5f9fb] p-2">
                  <p className="px-3 pb-2 pt-2 text-xs font-black uppercase tracking-[0.14em] text-[#118c87]">
                    {content.about}
                  </p>

                  {content.aboutMenu.map(
                    (item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-white hover:text-[#0965d8]"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>

                <Link
                  href={`/${locale}#contact`}
                  className="mt-2 block rounded-xl px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100"
                >
                  {content.contact}
                </Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      <FloatingWhatsApp
        locale={locale}
      />
    </>
  );
}