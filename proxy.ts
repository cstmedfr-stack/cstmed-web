
import { NextResponse, type NextRequest } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";

import { updateSession } from "@/lib/supabase/proxy";

function getPreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin: păstrăm actualizarea sesiunii Supabase
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return updateSession(request);
  }

  // Formular ExpoMedics: rută independentă de /ro și /fr
  if (
    pathname === "/salon/expomedics" ||
    pathname.startsWith("/salon/expomedics/")
  ) {
    return updateSession(request);
  }

  // Versiunea engleză: permitem TOATE subpaginile /en/*
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-cstmed-locale", "en");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Rutele normale RO și FR
  const firstSegment = pathname.split("/")[1];

  if (!isLocale(firstSegment)) {
    const locale = getPreferredLocale(request);
    const url = request.nextUrl.clone();

    url.pathname =
      pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-cstmed-locale", firstSegment);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(localeCookieName, firstSegment, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2)$).*)",
  ],
};
