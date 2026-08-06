export const legalConfig = {
  brandName: "CSTMed",

  contactEmail: "contact@cstmed.fr",
  phone: "+33 (0) 6 28 26 25 76",

  /*
   * Aceste informații trebuie completate înainte
   * de publicarea site-ului.
   *
   * Nu introducem încă CST FAMILY HOME SRL sau o
   * viitoare întreprindere franceză până nu este
   * stabilită entitatea care exploatează CSTMed.
   */
  publisher: {
    legalName: "DE COMPLETAT ÎNAINTE DE PUBLICARE",
    legalForm: "DE COMPLETAT",
    registrationNumber: "DE COMPLETAT",
    registeredOffice: "DE COMPLETAT",
    vatNumber: "DE COMPLETAT, DACĂ ESTE APLICABIL",
    publicationDirector: "DE COMPLETAT",
  },

  /*
   * Se completează după alegerea serviciului
   * de producție: Vercel, Hostinger etc.
   */
  hosting: {
    companyName: "DE COMPLETAT LA PUBLICAREA SITE-ULUI",
    address: "DE COMPLETAT",
    website: "DE COMPLETAT",
  },

  dataProviders: [
    "Supabase – bază de date, autentificare și stocare privată a CV-urilor",
    "Resend – trimiterea mesajelor electronice tranzacționale",
  ],
} as const;