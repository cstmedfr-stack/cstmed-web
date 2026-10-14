import "server-only";

const TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire";
const SEARCH_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";
const DETAIL_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres";

type TokenResponse = { access_token: string; expires_in?: number; token_type?: string };
export type FranceTravailOffer = {
  id: string; intitule: string; description?: string; dateCreation?: string; dateActualisation?: string;
  romeCode?: string; appellationlibelle?: string;
  lieuTravail?: { libelle?: string; latitude?: number; longitude?: number; codePostal?: string; commune?: string };
  entreprise?: { nom?: string; description?: string };
  typeContrat?: string; typeContratLibelle?: string; natureContrat?: string; dureeTravailLibelleConverti?: string;
  salaire?: { libelle?: string; commentaire?: string }; experienceLibelle?: string;
  formations?: unknown[]; competences?: unknown[]; langues?: unknown[]; contact?: unknown;
  urlPostulation?: string; origineOffre?: { origine?: string; urlOrigine?: string; partenaires?: unknown[] };
};
type SearchResponse = { resultats?: FranceTravailOffer[] };
let cachedToken: { value: string; expiresAt: number } | null = null;
function requireEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Lipsește variabila ${name}.`);
  return value;
}
async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: requireEnvironmentVariable("FRANCE_TRAVAIL_CLIENT_ID"),
    client_secret: requireEnvironmentVariable("FRANCE_TRAVAIL_CLIENT_SECRET"),
    scope: "api_offresdemploiv2 o2dsoffre",
  });
  const response = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body, cache: "no-store" });
  if (!response.ok) throw new Error(`Autentificarea France Travail a eșuat (${response.status}).`);
  const data = await response.json() as TokenResponse;
  if (!data.access_token) throw new Error("France Travail nu a returnat un token de acces.");
  cachedToken = { value: data.access_token, expiresAt: now + Number(data.expires_in ?? 1200) * 1000 };
  return data.access_token;
}
export async function searchFranceTravailOffers(options: { keyword: string; limit: number; cdiOnly: boolean }) {
  const token = await getAccessToken();
  const safeLimit = Math.min(Math.max(Math.trunc(options.limit), 1), 100);
  const parameters = new URLSearchParams({ motsCles: options.keyword, range: `0-${safeLimit - 1}` });
  if (options.cdiOnly) parameters.set("typeContrat", "CDI");
  const response = await fetch(`${SEARCH_URL}?${parameters.toString()}`, {
    method: "GET", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store",
  });
  if (response.status === 204) return [];
  if (!response.ok) throw new Error(`Căutarea France Travail a eșuat (${response.status}): ${await response.text()}`);
  const data = await response.json() as SearchResponse;
  return data.resultats ?? [];
}

// A 404/410 response means the offer is not retrievable via this API.
// This is NOT definitive proof that the position has been filled.
export async function checkFranceTravailOffer(id: string): Promise<{
  state: "active" | "unavailable" | "unknown"; note: string;
}> {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${DETAIL_URL}/${encodeURIComponent(id)}`, {
      method: "GET", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (response.ok && response.status === 200) {
      return { state: "active", note: "Offre consultable via l'API France Travail." };
    }
    if (response.status === 404 || response.status === 410) {
      return { state: "unavailable", note: `Annonce non disponible via l'API (${response.status}). À confirmer.` };
    }
    return { state: "unknown", note: `Impossible de confirmer (HTTP ${response.status}).` };
  } catch {
    return { state: "unknown", note: "Service indisponible ou délai dépassé." };
  }
}
