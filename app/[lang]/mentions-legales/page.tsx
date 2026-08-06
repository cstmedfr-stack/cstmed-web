import { notFound } from "next/navigation";

import { LegalDocumentPage } from "@/components/public/legal-document-page";
import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLegalDocuments } from "@/lib/i18n/legal-content";

type PageProps = {
  params: Promise<{
    lang: string;
  }>;
};

export default async function LegalNoticePage({
  params,
}: PageProps) {
  const { lang: requestedLang } = await params;

  if (!isLocale(requestedLang)) {
    notFound();
  }

  const locale: Locale = requestedLang;

  return (
    <LegalDocumentPage
      locale={locale}
      dictionary={getDictionary(locale)}
      document={getLegalDocuments(locale).legalNotice}
    />
  );
}