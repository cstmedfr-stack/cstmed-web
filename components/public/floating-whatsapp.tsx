import type { Locale } from "@/lib/i18n/config";
import { publicLinks } from "@/lib/site/public-links";

type FloatingWhatsAppProps = {  locale: Locale;
};

export function FloatingWhatsApp({
  locale,
}: FloatingWhatsAppProps) {
  const message =
    locale === "ro"
      ? "Bună ziua, doresc informații despre serviciile CSTMed."
      : "Bonjour, je souhaite obtenir des informations sur les services CSTMed.";

  const url =
    `https://wa.me/${publicLinks.whatsappNumber}` +
    `?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        locale === "ro"
          ? "Contactează CSTMed pe WhatsApp"
          : "Contacter CSTMed sur WhatsApp"
      }
      title={
        locale === "ro"
          ? "WhatsApp CSTMed"
          : "WhatsApp CSTMed"
      }
      className="fixed bottom-5 right-5 z-[70] flex h-15 w-15 items-center justify-center rounded-full bg-[#25d366] text-white shadow-2xl ring-4 ring-white transition hover:-translate-y-1 hover:bg-[#20bd5a]"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-8 w-8"
        fill="currentColor"
      >
        <path d="M12.04 2a9.86 9.86 0 0 0-8.47 14.9L2 22l5.23-1.52A9.99 9.99 0 1 0 12.04 2Zm0 17.98a8.04 8.04 0 0 1-4.1-1.12l-.3-.18-3.1.9.92-3.02-.2-.31a7.94 7.94 0 1 1 6.78 3.73Zm4.42-5.95c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2a7.23 7.23 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}