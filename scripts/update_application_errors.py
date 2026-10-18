"""Run from the root of the CSTMed project: python scripts/update_application_errors.py"""
from pathlib import Path
from shutil import copy2
import re

path = Path('app/[lang]/candidature/actions.ts')
if not path.is_file():
    raise SystemExit('Nu am gasit app/[lang]/candidature/actions.ts; ruleaza din radacina proiectului.')
s = path.read_text(encoding='utf-8')
if 'ENGLISH_ERROR_MESSAGES' in s:
    raise SystemExit('Mesajele in engleza au fost deja instalate; nu repet patch-ul.')
if 'export async function submitApplication(formData: FormData)' not in s:
    raise SystemExit('Nu gasesc functia de salvare asteptata; fisierul a fost modificat. Nimic nu a fost schimbat.')

# Add translation at the existing common redirect function, leaving all validation intact.
start = s.index('function redirectWithError(')
end = s.index('\n}', start) + 2
block = s[start:end]
if 'locale: Locale' not in block or 'error: message' not in block:
    raise SystemExit('Semnatura redirectWithError difera de versiunea analizata; nicio schimbare.')
translations = '''const ENGLISH_ERROR_MESSAGES: Record<string, string> = {
  "Complétez tous les champs obligatoires.": "Please complete all required fields.",
  "L’adresse e-mail n’est pas valide.": "Please enter a valid email address.",
  "Le numéro de téléphone n’est pas valide.": "Please enter a valid telephone number.",
  "Le niveau de français n’est pas valide.": "Please select a valid French language level.",
  "Vous devez accepter le traitement de votre candidature.": "Please confirm that you have read the privacy information and ask us to process your application.",
  "Veuillez joindre votre CV.": "Please attach your CV.",
  "Le CV dépasse la limite de 4 Mo.": "Your CV must be no larger than 4 MB.",
  "Le CV doit être au format PDF, DOC ou DOCX.": "Please upload a PDF, DOC or DOCX file.",
  "Le type du fichier CV ne correspond pas à son extension.": "The file content type does not match its extension.",
  "Le fichier CV ne possède pas la structure d’un document PDF, DOC ou DOCX valide. Choisissez un autre fichier.": "The CV is not a valid PDF, DOC or DOCX document. Please choose another file.",
  "Le CV n’a pas pu être téléchargé. Veuillez réessayer.": "Your CV could not be uploaded. Please try again.",
  "La candidature n’a pas pu être enregistrée. Veuillez réessayer.": "Your application could not be saved. Please try again.",
  "L’offre sélectionnée n’est pas valide.": "The selected job is invalid.",
  "L’offre sélectionnée n’est plus disponible.": "This job is no longer available.",
  "La vérification de la candidature a échoué. Réessayez plus tard.": "We could not verify your application. Please try again later.",
  "Vous avez déjà candidaté à cette offre ces 7 derniers jours. Contactez CSTMed pour mettre à jour votre dossier.": "You have already applied for this job in the last 7 days. Contact CSTMed to update your application.",
  "Trop de tentatives d’envoi. Veuillez réessayer dans une heure.": "Too many submissions. Please try again in an hour.",
  "La vérification de l’envoi est temporairement indisponible. Veuillez réessayer plus tard.": "Submission verification is temporarily unavailable. Please try again later.",
};

'''
s = s[:start] + translations + s[start:]
s = s.replace('function redirectWithError(locale: Locale, message: string, jobId?: string): never {', 'function redirectWithError(locale: Locale | "en", message: string, jobId?: string): never {', 1)
s = s.replace('const parameters = new URLSearchParams({ error: message });', 'const parameters = new URLSearchParams({ error: locale === "en" ? (ENGLISH_ERROR_MESSAGES[message] ?? "Your application could not be submitted. Please check the information and try again.") : message });', 1)
s = s.replace('  locale: Locale,\n  email: string,', '  locale: Locale | "en",\n  email: string,', 1)

# All errors inside submitApplication route to the matching language, while the DB/email locale remains FR.
head, body = s.split('export async function submitApplication(formData: FormData)', 1)
locale_anchor = 'const locale: Locale = isLocale(requestedLocale) ? requestedLocale : "ro";'
if locale_anchor not in body:
    raise SystemExit('Nu gasesc declaratia locale asteptata. Nimic nu a fost modificat.')
if 'const formLanguage =' not in body:
    body = body.replace(locale_anchor, locale_anchor + '\n  const formLanguage = getText(formData, "formLanguage", 2);', 1)
body = body.replace('const formLanguage = getText(formData, "formLanguage", 2);', 'const formLanguage = getText(formData, "formLanguage", 2);\n  const displayLocale: Locale | "en" = formLanguage === "en" && locale === "fr" ? "en" : locale;', 1)
body = body.replace('redirectWithError(locale,', 'redirectWithError(displayLocale,')
body = body.replace('enforceApplicationRateLimit(supabase, locale,', 'enforceApplicationRateLimit(supabase, displayLocale,')
body = body.replace('redirect(`/${locale}/candidature/merci`);', 'redirect(`/${displayLocale}/candidature/merci`);')
# Redirect final success is patched even if previous confirmation pack was already applied.
body = body.replace('redirect(`/${locale}/candidature/merci?${successParameters.toString()}`);', 'redirect(`/${displayLocale}/candidature/merci?${successParameters.toString()}`);')
body = body.replace('redirect(`/${successLocale}/candidature/merci?${successParameters.toString()}`);', 'redirect(`/${displayLocale}/candidature/merci?${successParameters.toString()}`);')
# If original confirmation patch introduced a successLocale variable, it is harmless.
s = head + 'export async function submitApplication(formData: FormData)' + body
if 'redirectWithError(displayLocale,' not in body or '/${displayLocale}/candidature/merci?' not in body:
    raise SystemExit('Patch incomplet; fisierul proiectului nu a fost schimbat.')
backup = path.with_name('actions.ts.before-en-errors.bak')
if backup.exists():
    raise SystemExit(f'Backup existent: {backup}. Patch oprit pentru a evita suprascrierea.')
copy2(path, backup)
path.write_text(s, encoding='utf-8')
print('OK: traduceri de erori EN si redirect EN instalate. Backup:', backup)
