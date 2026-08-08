import Image from "next/image";
import Link from "next/link";

import { HeaderLanguageSwitcher } from "@/components/public/header-language-switcher";
import { FloatingWhatsApp } from "@/components/public/floating-whatsapp";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
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

export function SiteHeader({
  locale,
  labels,
}: SiteHeaderProps) {
  const text =
    locale === "ro"
      ? {
          tagline:
            "Recrutare medicală • Franța – Europa",

          search:
            "Caută oferte",

          establishments:
            "Pentru unități medicale",

          method:
            "Metoda noastră",

          sendCv:
            "Trimite CV-ul",

          contact:
            "Contactează-ne",

          navigation:
            "Meniu",
        }
      : {
          tagline:
            "Recrutement médical • France – Europe",

          search:
            "Recherche d’offres",

          establishments:
            "Pour les établissements",

          method:
            "Notre méthode",

          sendCv:
            "Envoyer mon CV",

          contact:
            "Nous contacter",

          navigation:
            "Menu",
        };

  const navigationLinks = [
    {
      href: `/${locale}`,
      label: labels.nav.home,
    },
    {
      href: `/${locale}#medecins`,
      label: labels.nav.doctors,
    },
    {
      href: `/${locale}#etablissements`,
      label: text.establishments,
    },
    {
      href: `/${locale}#methode`,
      label: text.method,
    },
  ];

  return (
    <>
      <header className="relative z-50 bg-white shadow-sm">

        {/* Bara superioară */}
        <div className="bg-[#082a43] text-white">
          <div className="mx-auto flex min-h-9 max-w-[1400px] items-center justify-between gap-4 px-5 py-1.5 text-[11px] sm:px-8">

            <p className="font-semibold text-slate-200">
              {text.tagline}
            </p>

            <div className="hidden items-center gap-5 md:flex">

              <div className="flex items-center gap-2.5">

                {publicLinks.facebook ? (
                  <a
                    href={publicLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook CSTMed"
                    title="Facebook"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#65d9ce] hover:bg-[#65d9ce] hover:text-[#082a43]"
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
                    title="Instagram"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-[#65d9ce] hover:bg-[#65d9ce] hover:text-[#082a43]"
                  >
                    <InstagramIcon />
                  </a>
                ) : null}

              </div>

              <a
                href={`tel:${publicLinks.phoneHref}`}
                className="flex items-center gap-1.5 font-semibold transition hover:text-[#65d9ce]"
              >
                <PhoneIcon />
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

        {/* Header principal */}
        <div className="border-b border-slate-200">
          <div className="mx-auto flex min-h-[110px] max-w-[1400px] items-center gap-5 px-5 sm:px-8 lg:min-h-[104px]">

            {/* Logo */}
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
                className="h-auto w-[165px] object-contain sm:w-[180px]"
              />
            </Link>

            {/* Recherche d'offres */}
            <Link
              href={`/${locale}/offres`}
              className="hidden min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0D6EFD] px-6 py-3 text-[12px] font-black uppercase tracking-[0.03em] text-[#082A43] shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0B63E5] md:inline-flex lg:min-w-[235px]"
            >
              <SearchIcon />

              {text.search}
            </Link>

            {/* Navigație desktop */}
            <nav
              aria-label={text.navigation}
              className="ml-auto hidden items-center gap-4 lg:flex xl:gap-6"
            >
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-[12px] font-bold text-slate-700 transition hover:text-[#0965d8] xl:text-[13px]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Dreapta */}
            <div className="ml-auto flex shrink-0 items-center gap-3 lg:ml-0">

              <HeaderLanguageSwitcher
                locale={locale}
              />

              <Link
                href={`/${locale}#contact`}
                className="hidden whitespace-nowrap rounded-full bg-[#118c87] px-5 py-3 text-[12px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0c7773] xl:inline-flex"
              >
                {text.contact}
              </Link>

            </div>

          </div>

          {/* Recherche d'offres pe tabletă / telefon */}
          <div className="px-5 pb-4 md:hidden sm:px-8">
            <Link
              href={`/${locale}/offres`}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0D6EFD] px-6 py-3 text-[12px] font-black uppercase tracking-[0.03em] text-[#082A43] shadow-lg"
            >
              <SearchIcon />
              {text.search}
            </Link>
          </div>
        </div>

        {/* Meniu mobil */}
        <div className="border-b border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">

            <details className="group">

              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-bold text-[#082a43]">

                <span>
                  {text.navigation}
                </span>

                <span className="text-xl transition group-open:rotate-45">
                  +
                </span>

              </summary>

              <div className="grid gap-1 border-t border-slate-100 pb-5 pt-3">

                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-[#0965d8]"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href={`/${locale}/candidature`}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-[#0965d8]"
                >
                  {text.sendCv}
                </Link>

                <Link
                  href={`/${locale}#contact`}
                  className="mt-2 rounded-full bg-[#118c87] px-5 py-3 text-center text-sm font-bold text-white"
                >
                  {text.contact}
                </Link>

                <div className="mt-4 flex items-center gap-3">

                  {publicLinks.facebook ? (
                    <a
                      href={publicLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-[#082a43]"
                      aria-label="Facebook CSTMed"
                    >
                      <FacebookIcon />
                    </a>
                  ) : null}

                  {publicLinks.instagram ? (
                    <a
                      href={publicLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-[#082a43]"
                      aria-label="Instagram CSTMed"
                    >
                      <InstagramIcon />
                    </a>
                  ) : null}

                </div>

              </div>
            </details>

          </div>
        </div>

      </header>

      <FloatingWhatsApp locale={locale} />
    </>
  );
}