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

      lastUpdated: "11 août 2026",

      sections: [
        {
          title: "Éditeur du site",
          paragraphs: [
            `Le site CSTMed est édité par : ${legalConfig.publisher.legalName}.`,
            `Statut actuel : ${legalConfig.publisher.legalForm}.`,
            `Numéro d’immatriculation : ${legalConfig.publisher.registrationNumber}.`,
            `Numéro de TVA : ${legalConfig.publisher.vatNumber}.`,
            `Adresse de contact : ${legalConfig.publisher.registeredOffice}.`,
          ],
        },
        {
          title: "Situation actuelle de CSTMed",
          paragraphs: [
            "CSTMed est actuellement un projet en phase de lancement et de validation de son activité.",
            "Aucune prestation commerciale n’est facturée par CSTMed tant que l’activité professionnelle n’a pas été immatriculée.",
            "Les présentes mentions légales seront mises à jour dès l’immatriculation de l’activité afin d’indiquer les informations professionnelles définitives, notamment le numéro SIREN/SIRET et, le cas échéant, le numéro de TVA intracommunautaire.",
          ],
        },
        {
          title: "Directeur de la publication",
          paragraphs: [
            `Directrice de la publication : ${legalConfig.publisher.publicationDirector}.`,
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
            "CSTMed présente des opportunités professionnelles dans le domaine médical et propose un accompagnement aux médecins ainsi qu’aux établissements de santé.",
            "Le site permet notamment aux médecins de consulter des offres et de transmettre volontairement leur candidature et leur CV.",
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
            "Les utilisateurs restent responsables de la vérification des conditions du poste et de l’exactitude des informations communiquées dans leur candidature.",
          ],
        },
      ],
    },

    privacy: {
      eyebrow: "Protection des données",
      title: "Politique de confidentialité",

      intro:
        "Cette politique explique comment CSTMed collecte, utilise, protège et conserve les données personnelles transmises par les candidats et les visiteurs.",

      lastUpdated: "11 août 2026",

      sections: [
        {
          title: "Responsable du traitement",
          paragraphs: [
            `Le responsable du traitement des données collectées par CSTMed est ${legalConfig.publisher.legalName}.`,
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
            "Contacter le candidat et organiser les échanges liés à son projet professionnel.",
            "Présenter un profil à un établissement de santé lorsque cela est nécessaire dans le cadre de la candidature ou du projet du candidat.",
            "Conserver le profil pour de futures opportunités lorsque le candidat a choisi cette option.",
            "Assurer la sécurité du site et prévenir les utilisations frauduleuses.",
          ],
        },
        {
          title: "Bases juridiques",
          paragraphs: [
            "Le traitement des données transmises dans le cadre d’une candidature est nécessaire à l’examen de la demande du candidat et à la gestion de la mise en relation professionnelle.",
            "Certains traitements peuvent également reposer sur l’intérêt légitime de CSTMed à assurer le suivi des candidatures et le fonctionnement de son service.",
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
            "Les personnes habilitées à gérer CSTMed et les candidatures reçues.",
            "Les établissements de santé concernés par une candidature lorsque la transmission du profil est nécessaire et appropriée.",
            "Les prestataires techniques intervenant pour l’hébergement, la base de données, le stockage privé et l’envoi des courriels.",
          ],
        },
        {
          title: "Prestataires techniques",
          bullets: [
            "Vercel – hébergement et mise à disposition du site.",
            "Supabase – base de données, authentification et stockage privé des CV.",
            "Resend – envoi des courriels transactionnels liés au fonctionnement du service.",
          ],
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
            "CSTMed limite l’accès aux candidatures aux personnes qui en ont besoin pour assurer leur traitement.",
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
            "Certains prestataires techniques peuvent traiter des données depuis plusieurs régions ou pays.",
            "CSTMed sélectionne des prestataires proposant des garanties contractuelles, organisationnelles et techniques adaptées à la protection des données.",
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

      lastUpdated: "11 août 2026",

      sections: [
        {
          title: "Cookies actuellement utilisés",
          bullets: [
            "Cookie ou mécanisme de préférence linguistique : mémorise le choix entre le roumain et le français.",
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
            "Aucun bandeau d’acceptation n’est affiché tant que seuls des cookies strictement nécessaires ou des mécanismes de préférence ne nécessitant pas de consentement sont utilisés.",
            "Si CSTMed ajoute ultérieurement des outils d’analyse, de publicité, des vidéos externes ou des fonctionnalités sociales nécessitant un consentement, un mécanisme permettant d’accepter, de refuser et de retirer le consentement sera mis en place.",
          ],
        },
        {
          title: "Gestion depuis le navigateur",
          paragraphs: [
            "Vous pouvez supprimer ou bloquer les cookies depuis les réglages de votre navigateur.",
            "Le blocage de cookies strictement nécessaires peut empêcher certaines fonctionnalités, notamment l’accès à l’administration.",
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

      lastUpdated: "11 august 2026",

      sections: [
        {
          title: "Editorul site-ului",
          paragraphs: [
            `Site-ul CSTMed este editat de: ${legalConfig.publisher.legalName}.`,
            `Statut actual: ${legalConfig.publisher.legalForm}.`,
            `Număr de înregistrare: ${legalConfig.publisher.registrationNumber}.`,
            `Cod TVA: ${legalConfig.publisher.vatNumber}.`,
            `Adresă de contact: ${legalConfig.publisher.registeredOffice}.`,
          ],
        },
        {
          title: "Situația actuală a CSTMed",
          paragraphs: [
            "CSTMed este în prezent un proiect aflat în faza de lansare și de validare a activității.",
            "CSTMed nu facturează servicii comerciale înainte de înregistrarea oficială a activității profesionale.",
            "Prezentele mențiuni legale vor fi actualizate imediat după înregistrarea activității, pentru a include datele profesionale definitive, în special numărul SIREN/SIRET și, dacă este cazul, codul de TVA intracomunitar.",
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
            "Site-ul permite în special medicilor să consulte oferte și să transmită voluntar candidatura și CV-ul.",
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
            "Utilizatorii trebuie să verifice condițiile postului și exactitatea informațiilor transmise prin candidatură.",
          ],
        },
      ],
    },

    privacy: {
      eyebrow: "Protecția datelor",
      title: "Politica de confidențialitate",

      intro:
        "Această politică explică modul în care CSTMed colectează, utilizează, protejează și păstrează datele transmise de candidați și vizitatori.",

      lastUpdated: "11 august 2026",

      sections: [
        {
          title: "Operatorul datelor",
          paragraphs: [
            `Operatorul datelor colectate prin CSTMed este ${legalConfig.publisher.legalName}.`,
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
            "Contactarea candidatului și organizarea etapelor legate de proiectul său profesional.",
            "Prezentarea profilului către o unitate medicală atunci când acest lucru este necesar în cadrul candidaturii sau proiectului candidatului.",
            "Păstrarea profilului pentru alte oportunități, atunci când candidatul a ales această opțiune.",
            "Protejarea site-ului și prevenirea utilizărilor frauduloase.",
          ],
        },
        {
          title: "Temeiurile prelucrării",
          paragraphs: [
            "Prelucrarea datelor transmise printr-o candidatură este necesară pentru analizarea solicitării candidatului și gestionarea punerii în legătură profesionale.",
            "Anumite prelucrări se pot baza și pe interesul legitim al CSTMed de a asigura urmărirea candidaturilor și funcționarea serviciului.",
            "Păstrarea profilului pentru alte oportunități se bazează pe alegerea opțională exprimată de candidat în formular.",
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
            "Persoanele autorizate să gestioneze CSTMed și candidaturile primite.",
            "Unitățile medicale vizate de o candidatură, atunci când transmiterea profilului este necesară și justificată.",
            "Furnizorii tehnici pentru găzduire, baze de date, stocare privată și e-mailuri.",
          ],
        },
        {
          title: "Furnizori tehnici",
          bullets: [
            "Vercel – găzduirea și publicarea site-ului.",
            "Supabase – bază de date, autentificare și stocarea privată a CV-urilor.",
            "Resend – trimiterea e-mailurilor tranzacționale necesare funcționării serviciului.",
          ],
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
            "CSTMed limitează accesul la candidaturi la persoanele care au nevoie de aceste informații pentru prelucrarea lor.",
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
            "Dreptul de opoziție la prelucrările bazate pe interes legitim.",
            "Dreptul de a retrage în orice moment opțiunea privind oportunitățile viitoare.",
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
            "Anumiți furnizori tehnici pot prelucra date din mai multe regiuni sau țări.",
            "CSTMed selectează furnizori care oferă garanții contractuale, organizatorice și tehnice adecvate pentru protecția datelor.",
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

      lastUpdated: "11 august 2026",

      sections: [
        {
          title: "Module cookie utilizate",
          bullets: [
            "Cookie sau mecanism de preferință lingvistică: memorează alegerea dintre română și franceză.",
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
            "Nu este afișată o bandă de acceptare cât timp site-ul utilizează numai cookie-uri strict necesare sau mecanisme de preferință care nu necesită consimțământ.",
            "Dacă ulterior vor fi adăugate instrumente de analiză, publicitate, materiale video externe sau funcții sociale care necesită consimțământ, va fi implementat un mecanism de acceptare, refuz și retragere a acordului.",
          ],
        },
        {
          title: "Setările browserului",
          paragraphs: [
            "Cookie-urile pot fi șterse sau blocate din setările browserului.",
            "Blocarea cookie-urilor necesare poate împiedica funcționarea anumitor componente, în special accesul la panoul administrativ.",
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