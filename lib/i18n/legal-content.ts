import type { Locale } from "@/lib/i18n/config";
import { legalConfig } from "@/lib/site/legal-config";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  warning?: string;
  lastUpdated: string;
  sections: LegalSection[];
};

type LegalDocuments = {
  legalNotice: LegalDocument;
  privacy: LegalDocument;
  cookies: LegalDocument;
};

function getFrenchDocuments(): LegalDocuments {
  return {
    legalNotice: {
      eyebrow: "Informations juridiques",
      title: "Mentions légales",

      intro:
        "Les présentes mentions légales identifient l’éditeur du site CSTMed et précisent les principales conditions de son utilisation.",

      warning:
        "Les informations signalées « À COMPLÉTER » devront être remplacées par les données définitives de l’entité exploitant CSTMed avant la mise en ligne publique.",

      lastUpdated: "6 août 2026",

      sections: [
        {
          title: "Éditeur du site",
          paragraphs: [
            `Le site CSTMed est édité par : ${legalConfig.publisher.legalName}.`,
            `Forme juridique : ${legalConfig.publisher.legalForm}.`,
            `Numéro d’immatriculation : ${legalConfig.publisher.registrationNumber}.`,
            `Numéro de TVA : ${legalConfig.publisher.vatNumber}.`,
            `Siège social : ${legalConfig.publisher.registeredOffice}.`,
          ],
        },
        {
          title: "Directeur de la publication",
          paragraphs: [
            `Directeur ou directrice de la publication : ${legalConfig.publisher.publicationDirector}.`,
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Adresse électronique : ${legalConfig.contactEmail}.`,
            `Téléphone : ${legalConfig.phone}.`,
          ],
        },
        {
          title: "Hébergement",
          paragraphs: [
            `Hébergeur : ${legalConfig.hosting.companyName}.`,
            `Adresse : ${legalConfig.hosting.address}.`,
            `Site internet : ${legalConfig.hosting.website}.`,
          ],
        },
        {
          title: "Objet du site",
          paragraphs: [
            "CSTMed présente des opportunités professionnelles dans le domaine médical et propose un accompagnement aux médecins et aux établissements de santé.",
            "La publication d’une offre sur le site ne constitue ni une promesse d’embauche, ni une garantie de recrutement.",
          ],
        },
        {
          title: "Propriété intellectuelle",
          paragraphs: [
            "Les textes, éléments graphiques, logos, composants et contenus propres à CSTMed sont protégés par les règles relatives à la propriété intellectuelle.",
            "Toute reproduction ou réutilisation substantielle sans autorisation préalable est interdite, sauf exception prévue par la loi.",
          ],
        },
        {
          title: "Contenus provenant de tiers",
          paragraphs: [
            "Certaines offres peuvent provenir de services ou de partenaires externes, notamment France Travail.",
            "CSTMed peut reformuler, classer ou traduire certaines informations afin de les présenter aux candidats. Le contenu original en français demeure la référence lorsqu’il est disponible.",
          ],
        },
        {
          title: "Responsabilité",
          paragraphs: [
            "CSTMed met en œuvre des moyens raisonnables afin de présenter des informations actualisées, mais ne peut garantir l’absence totale d’erreur ou l’actualité permanente de toutes les offres.",
            "Les utilisateurs restent responsables de la vérification des conditions du poste et des informations communiquées dans leur candidature.",
          ],
        },
      ],
    },

    privacy: {
      eyebrow: "Protection des données",
      title: "Politique de confidentialité",

      intro:
        "Cette politique explique comment CSTMed collecte, utilise, protège et conserve les données personnelles transmises par les candidats et les visiteurs.",

      lastUpdated: "6 août 2026",

      sections: [
        {
          title: "Responsable du traitement",
          paragraphs: [
            `Le responsable du traitement est ${legalConfig.publisher.legalName}, exploitant la marque CSTMed.`,
            `Pour toute question relative aux données personnelles : ${legalConfig.contactEmail}.`,
          ],
        },
        {
          title: "Données collectées",
          bullets: [
            "Identité : prénom et nom.",
            "Coordonnées : adresse électronique, numéro de téléphone, pays et ville.",
            "Informations professionnelles : spécialité, expérience, niveau de français et projet professionnel.",
            "Documents transmis volontairement, notamment le curriculum vitae.",
            "Offre à laquelle la candidature est associée.",
            "Informations techniques nécessaires à la sécurité et au fonctionnement du service.",
          ],
        },
        {
          title: "Finalités",
          bullets: [
            "Recevoir, enregistrer et examiner les candidatures.",
            "Évaluer l’adéquation du profil avec une offre ou un besoin de recrutement.",
            "Contacter le candidat et organiser les échanges liés au recrutement.",
            "Présenter, avec l’accord ou dans le cadre approprié, un profil à un établissement de santé.",
            "Conserver le profil pour de futures opportunités lorsque le candidat a choisi cette option.",
            "Assurer la sécurité du site et prévenir les utilisations frauduleuses.",
          ],
        },
        {
          title: "Bases juridiques",
          paragraphs: [
            "Le traitement d’une candidature repose sur les démarches réalisées à la demande du candidat et sur l’intérêt légitime de CSTMed à gérer les candidatures et les mises en relation professionnelles.",
            "La conservation du profil pour de futures opportunités repose sur le choix facultatif exprimé par le candidat dans le formulaire.",
            "Les traitements nécessaires à la sécurité du service reposent sur l’intérêt légitime de CSTMed à protéger son site, ses utilisateurs et ses données.",
          ],
        },
        {
          title: "Caractère obligatoire ou facultatif",
          paragraphs: [
            "Les champs signalés par un astérisque sont nécessaires à l’examen de la candidature.",
            "Le refus de fournir ces informations peut empêcher CSTMed de traiter la demande.",
            "L’accord relatif aux futures opportunités est facultatif et son refus n’empêche pas le traitement de la candidature actuelle.",
          ],
        },
        {
          title: "Destinataires",
          bullets: [
            "Les personnes habilitées au sein de CSTMed.",
            "Les établissements de santé concernés par une candidature, lorsque la transmission est nécessaire et appropriée.",
            "Les prestataires techniques intervenant pour l’hébergement, la base de données, le stockage privé et l’envoi des courriels.",
          ],
        },
        {
          title: "Prestataires techniques",
          bullets: [...legalConfig.dataProviders],
        },
        {
          title: "Durées de conservation",
          paragraphs: [
            "Les données sont conservées pendant la durée nécessaire à l’examen et au suivi de la candidature.",
            "Lorsqu’un candidat accepte de rester dans le vivier CSTMed, son profil pourra être conservé pendant une durée maximale de deux ans à compter du dernier contact, sauf renouvellement de son choix.",
            "Les données peuvent être conservées plus longtemps lorsqu’une obligation légale ou la défense d’un droit en justice le justifie, dans une archive à accès limité.",
          ],
        },
        {
          title: "Sécurité",
          paragraphs: [
            "Les CV sont stockés dans un espace privé et ne disposent pas d’une adresse publique permanente.",
            "L’accès administratif est protégé par authentification et les téléchargements de CV utilisent des liens temporaires.",
            "Malgré les mesures mises en place, aucun service en ligne ne peut garantir une sécurité absolue.",
          ],
        },
        {
          title: "Droits des personnes",
          bullets: [
            "Droit d’accès aux données.",
            "Droit de rectification.",
            "Droit à l’effacement, lorsque les conditions sont réunies.",
            "Droit à la limitation du traitement.",
            "Droit d’opposition aux traitements fondés sur l’intérêt légitime.",
            "Droit de retirer à tout moment le choix relatif aux futures opportunités.",
            "Droit à la portabilité lorsque ce droit est applicable.",
          ],
          paragraphs: [
            `Pour exercer ces droits, écrivez à ${legalConfig.contactEmail} en précisant votre identité et la demande concernée.`,
            "Une réclamation peut également être adressée à l’autorité de contrôle compétente, notamment la CNIL en France.",
          ],
        },
        {
          title: "Transferts et sous-traitants",
          paragraphs: [
            "Certains prestataires peuvent traiter des données depuis plusieurs régions ou pays. CSTMed sélectionne des prestataires offrant des garanties contractuelles et techniques adaptées.",
          ],
        },
        {
          title: "Mise à jour de la politique",
          paragraphs: [
            "Cette politique peut être modifiée afin de refléter une évolution du service, de la réglementation ou des prestataires utilisés.",
            "La date de la dernière mise à jour est indiquée en haut de la page.",
          ],
        },
      ],
    },

    cookies: {
      eyebrow: "Navigation et traceurs",
      title: "Politique relative aux cookies",

      intro:
        "Cette page présente les cookies et mécanismes similaires utilisés actuellement sur CSTMed.",

      lastUpdated: "6 août 2026",

      sections: [
        {
          title: "Cookies actuellement utilisés",
          bullets: [
            "Cookie de préférence linguistique : mémorise le choix entre le roumain et le français.",
            "Cookies techniques d’authentification : utilisés uniquement pour sécuriser l’espace d’administration.",
            "Éléments techniques strictement nécessaires au fonctionnement et à la sécurité du site.",
          ],
        },
        {
          title: "Mesure d’audience et publicité",
          paragraphs: [
            "Dans sa configuration actuelle, CSTMed n’utilise pas de cookies publicitaires, de profilage ni de mesure d’audience non essentielle.",
            "Aucun contenu externe nécessitant un dépôt préalable de cookies publicitaires n’est chargé automatiquement.",
          ],
        },
        {
          title: "Bandeau de consentement",
          paragraphs: [
            "Aucun bandeau d’acceptation n’est affiché tant que seuls des cookies strictement nécessaires ou de préférence linguistique sont utilisés.",
            "Si CSTMed ajoute ultérieurement des outils d’analyse, de publicité, des vidéos externes ou des fonctionnalités sociales nécessitant un consentement, un mécanisme permettant d’accepter, de refuser et de retirer le consentement sera mis en place.",
          ],
        },
        {
          title: "Gestion depuis le navigateur",
          paragraphs: [
            "Vous pouvez supprimer ou bloquer les cookies depuis les réglages de votre navigateur.",
            "Le blocage de cookies strictement nécessaires peut empêcher certaines fonctionnalités, notamment la mémorisation de la langue ou l’accès à l’administration.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Pour toute question concernant les cookies : ${legalConfig.contactEmail}.`,
          ],
        },
      ],
    },
  };
}

function getRomanianDocuments(): LegalDocuments {
  return {
    legalNotice: {
      eyebrow: "Informații juridice",
      title: "Mențiuni legale",

      intro:
        "Prezentele mențiuni identifică editorul site-ului CSTMed și precizează principalele condiții de utilizare.",

      warning:
        "Informațiile marcate „DE COMPLETAT” trebuie înlocuite cu datele definitive ale entității care exploatează CSTMed înainte de publicarea site-ului.",

      lastUpdated: "6 august 2026",

      sections: [
        {
          title: "Editorul site-ului",
          paragraphs: [
            `Site-ul CSTMed este editat de: ${legalConfig.publisher.legalName}.`,
            `Forma juridică: ${legalConfig.publisher.legalForm}.`,
            `Număr de înregistrare: ${legalConfig.publisher.registrationNumber}.`,
            `Cod TVA: ${legalConfig.publisher.vatNumber}.`,
            `Sediu social: ${legalConfig.publisher.registeredOffice}.`,
          ],
        },
        {
          title: "Directorul publicației",
          paragraphs: [
            `Directorul publicației: ${legalConfig.publisher.publicationDirector}.`,
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `E-mail: ${legalConfig.contactEmail}.`,
            `Telefon: ${legalConfig.phone}.`,
          ],
        },
        {
          title: "Găzduire",
          paragraphs: [
            `Furnizor de găzduire: ${legalConfig.hosting.companyName}.`,
            `Adresă: ${legalConfig.hosting.address}.`,
            `Site: ${legalConfig.hosting.website}.`,
          ],
        },
        {
          title: "Obiectul site-ului",
          paragraphs: [
            "CSTMed prezintă oportunități profesionale în domeniul medical și oferă sprijin medicilor și unităților medicale.",
            "Publicarea unei oferte nu reprezintă o promisiune de angajare și nu garantează finalizarea recrutării.",
          ],
        },
        {
          title: "Proprietate intelectuală",
          paragraphs: [
            "Textele, grafica, sigla, componentele și conținuturile proprii CSTMed sunt protejate de legislația privind proprietatea intelectuală.",
            "Reproducerea sau reutilizarea substanțială fără autorizare prealabilă este interzisă, cu excepția cazurilor permise de lege.",
          ],
        },
        {
          title: "Conținut provenit de la terți",
          paragraphs: [
            "Unele oferte pot proveni de la servicii sau parteneri externi, inclusiv France Travail.",
            "CSTMed poate reformula, clasifica sau traduce anumite informații. Varianta originală în franceză rămâne versiunea de referință atunci când este disponibilă.",
          ],
        },
        {
          title: "Răspundere",
          paragraphs: [
            "CSTMed depune eforturi rezonabile pentru prezentarea unor informații actualizate, dar nu poate garanta lipsa totală a erorilor sau disponibilitatea permanentă a ofertelor.",
            "Utilizatorii trebuie să verifice condițiile postului și informațiile transmise prin candidatură.",
          ],
        },
      ],
    },

    privacy: {
      eyebrow: "Protecția datelor",
      title: "Politica de confidențialitate",

      intro:
        "Această politică explică modul în care CSTMed colectează, utilizează, protejează și păstrează datele transmise de candidați și vizitatori.",

      lastUpdated: "6 august 2026",

      sections: [
        {
          title: "Operatorul datelor",
          paragraphs: [
            `Operatorul datelor este ${legalConfig.publisher.legalName}, entitatea care exploatează CSTMed.`,
            `Pentru întrebări privind datele personale: ${legalConfig.contactEmail}.`,
          ],
        },
        {
          title: "Date colectate",
          bullets: [
            "Identitate: nume și prenume.",
            "Date de contact: e-mail, telefon, țară și localitate.",
            "Informații profesionale: specialitate, experiență, nivelul limbii franceze și proiect profesional.",
            "Documente transmise voluntar, inclusiv CV-ul.",
            "Oferta asociată candidaturii.",
            "Informații tehnice necesare funcționării și securității serviciului.",
          ],
        },
        {
          title: "Scopurile prelucrării",
          bullets: [
            "Primirea, înregistrarea și analizarea candidaturilor.",
            "Evaluarea potrivirii profilului cu un post sau cu o nevoie de recrutare.",
            "Contactarea candidatului și organizarea etapelor recrutării.",
            "Prezentarea profilului către o unitate medicală în cadrul corespunzător.",
            "Păstrarea profilului pentru alte oportunități, atunci când candidatul a ales această opțiune.",
            "Protejarea site-ului și prevenirea utilizărilor frauduloase.",
          ],
        },
        {
          title: "Temeiurile prelucrării",
          paragraphs: [
            "Analizarea candidaturii se bazează pe demersurile solicitate de candidat și pe interesul legitim al CSTMed de a gestiona candidaturile și punerea în legătură profesională.",
            "Păstrarea profilului pentru alte oportunități se bazează pe alegerea opțională exprimată în formular.",
            "Măsurile de securitate se bazează pe interesul legitim al CSTMed de a proteja serviciul și datele.",
          ],
        },
        {
          title: "Câmpuri obligatorii și opționale",
          paragraphs: [
            "Câmpurile marcate cu asterisc sunt necesare pentru analizarea candidaturii.",
            "Lipsa acestor informații poate împiedica prelucrarea cererii.",
            "Păstrarea profilului pentru oportunități viitoare este opțională și nu condiționează candidatura actuală.",
          ],
        },
        {
          title: "Destinatarii datelor",
          bullets: [
            "Persoanele autorizate din cadrul CSTMed.",
            "Unitățile medicale vizate de o candidatură, atunci când transmiterea este necesară și justificată.",
            "Furnizorii tehnici pentru găzduire, baze de date, stocare privată și e-mailuri.",
          ],
        },
        {
          title: "Furnizori tehnici",
          bullets: [...legalConfig.dataProviders],
        },
        {
          title: "Durata păstrării",
          paragraphs: [
            "Datele sunt păstrate pe durata necesară analizării și urmăririi candidaturii.",
            "Dacă medicul acceptă includerea în baza de candidați CSTMed, profilul poate fi păstrat cel mult doi ani de la ultimul contact, dacă opțiunea nu este reînnoită.",
            "Anumite date pot fi arhivate pentru o perioadă suplimentară atunci când există o obligație legală sau este necesară apărarea unui drept.",
          ],
        },
        {
          title: "Securitatea",
          paragraphs: [
            "CV-urile sunt păstrate într-un spațiu privat și nu au o adresă publică permanentă.",
            "Accesul administrativ este protejat prin autentificare, iar descărcarea CV-urilor se face prin legături temporare.",
            "Niciun serviciu online nu poate garanta însă o securitate absolută.",
          ],
        },
        {
          title: "Drepturile persoanelor",
          bullets: [
            "Dreptul de acces.",
            "Dreptul la rectificare.",
            "Dreptul la ștergere, în condițiile legii.",
            "Dreptul la restricționarea prelucrării.",
            "Dreptul de opoziție.",
            "Dreptul de a retrage opțiunea privind oportunitățile viitoare.",
            "Dreptul la portabilitate, atunci când este aplicabil.",
          ],
          paragraphs: [
            `Pentru exercitarea drepturilor, scrie la ${legalConfig.contactEmail}, precizând identitatea și solicitarea.`,
            "Persoana vizată poate depune și o plângere la autoritatea competentă pentru protecția datelor, inclusiv CNIL în Franța.",
          ],
        },
        {
          title: "Furnizori și transferuri",
          paragraphs: [
            "Anumiți furnizori pot prelucra date din mai multe regiuni sau țări. CSTMed selectează furnizori care oferă garanții contractuale și tehnice adecvate.",
          ],
        },
        {
          title: "Actualizarea politicii",
          paragraphs: [
            "Politica poate fi actualizată pentru a reflecta schimbările serviciului, legislației sau furnizorilor utilizați.",
            "Data ultimei actualizări este afișată în partea de sus.",
          ],
        },
      ],
    },

    cookies: {
      eyebrow: "Navigare și module cookie",
      title: "Politica privind modulele cookie",

      intro:
        "Această pagină descrie modulele cookie și mecanismele similare utilizate în prezent de CSTMed.",

      lastUpdated: "6 august 2026",

      sections: [
        {
          title: "Module cookie utilizate",
          bullets: [
            "Preferința de limbă: memorează alegerea dintre română și franceză.",
            "Cookie-uri tehnice de autentificare: utilizate pentru protejarea panoului de administrare.",
            "Elemente tehnice strict necesare funcționării și securității site-ului.",
          ],
        },
        {
          title: "Analiză și publicitate",
          paragraphs: [
            "În configurația actuală, CSTMed nu utilizează cookie-uri publicitare, de profilare sau de analiză neesențială.",
            "Site-ul nu încarcă automat conținut extern care să necesite în prealabil acordul pentru cookie-uri publicitare.",
          ],
        },
        {
          title: "Banda de consimțământ",
          paragraphs: [
            "Nu este afișată o bandă de acceptare cât timp site-ul utilizează numai cookie-uri strict necesare și de preferință lingvistică.",
            "Dacă ulterior vor fi adăugate instrumente de analiză, publicitate, materiale video externe sau funcții sociale, va fi implementat un mecanism de acceptare, refuz și retragere a acordului.",
          ],
        },
        {
          title: "Setările browserului",
          paragraphs: [
            "Cookie-urile pot fi șterse sau blocate din setările browserului.",
            "Blocarea cookie-urilor necesare poate împiedica memorarea limbii sau funcționarea panoului administrativ.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Pentru întrebări privind cookie-urile: ${legalConfig.contactEmail}.`,
          ],
        },
      ],
    },
  };
}

export function getLegalDocuments(
  locale: Locale,
): LegalDocuments {
  return locale === "ro"
    ? getRomanianDocuments()
    : getFrenchDocuments();
}