import Image from "next/image";
const services = [
  {
    number: "01",
    title: "Sélection rigoureuse",
    description:
      "Analyse des profils, de l’expérience professionnelle, des diplômes et du niveau de français.",
  },
  {
    number: "02",
    title: "Accompagnement administratif",
    description:
      "Soutien dans les démarches nécessaires à l’exercice de la médecine en France.",
  },
  {
    number: "03",
    title: "Mise en relation ciblée",
    description:
      "Présentation de candidats correspondant réellement aux besoins de chaque établissement.",
  },
  {
    number: "04",
    title: "Suivi d’intégration",
    description:
      "Accompagnement avant, pendant et après la prise de poste en France.",
  },
];

const processSteps = [
  {
    step: "1",
    title: "Analyse du besoin",
    description:
      "Nous étudions le projet du médecin ou les besoins précis de l’établissement.",
  },
  {
    step: "2",
    title: "Sélection ciblée",
    description:
      "Nous identifions les profils et les opportunités les plus adaptés.",
  },
  {
    step: "3",
    title: "Entretiens et validation",
    description:
      "Nous organisons les échanges entre le candidat et l’établissement.",
  },
  {
    step: "4",
    title: "Installation et suivi",
    description:
      "Nous accompagnons les démarches et l’intégration jusqu’à la prise de poste.",
  },
];

const specialties = [
  "Médecine générale",
  "Gériatrie",
  "Anesthésie-Réanimation",
  "Médecine d’urgence",
  "Cardiologie",
  "Radiologie",
  "Psychiatrie",
  "Gynécologie-obstétrique",
  "Chirurgie",
  "Pneumologie",
  "Neurologie",
  "Autres spécialités",
];

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 shrink-0 fill-current"
    >
      <path d="M7.75 14.5 3.5 10.25l1.4-1.4 2.85 2.85 7.35-7.35 1.4 1.4-8.75 8.75Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-white text-[#102435]">
      <div className="bg-[#082a43] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2.5 text-xs sm:px-8 sm:text-sm">
          <p>Recrutement médical • France – Europe</p>

          <div className="flex items-center gap-5">
            <a
              href="tel:+33628262576"
              className="hidden transition hover:text-[#8ce1d8] sm:inline"
            >
              +33 (0) 6 28 26 25 76
            </a>

            <a
              href="mailto:contact@cstmed.fr"
              className="transition hover:text-[#8ce1d8]"
            >
              contact@cstmed.fr
            </a>

            <span className="rounded-full border border-white/20 px-2.5 py-1 text-[11px]">
              FR&nbsp;&nbsp;|&nbsp;&nbsp;RO
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-5 py-4 sm:px-8">
          <a href="#top" className="shrink-0" aria-label="CSTMed – Accueil">
  <Image
    src="/images/cstmed-logo.jpg"
    alt="CSTMed – Parce que ta valeur doit être appréciée"
    width={240}
    height={80}
    priority
    className="h-auto w-[185px] object-contain sm:w-[220px] lg:w-[240px]"
  />
</a>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-7 text-sm font-medium text-slate-700 lg:flex"
          >
            <a href="#top" className="transition hover:text-[#118c87]">
              Accueil
            </a>
            <a href="#medecins" className="transition hover:text-[#118c87]">
              Médecins
            </a>
            <a href="/offres" className="transition hover:text-[#118c87]">
  Offres
</a>
            <a
              href="#etablissements"
              className="transition hover:text-[#118c87]"
            >
              Recruteurs
            </a>
            <a href="#methode" className="transition hover:text-[#118c87]">
              Notre méthode
            </a>
          </nav>

          <a
            href="#contact"
            className="rounded-full bg-[#118c87] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c7773]"
          >
            Nous contacter
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#082a43] via-[#0c3c5d] to-[#11696d] text-white">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/[0.07] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[#59d2c6]/20 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-[#76e0d5]" />
              Accompagnement complet et personnalisé
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Recrutement médical entre la France et l’Europe
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              CSTMed accompagne les médecins dans leur projet professionnel en
              France et aide les établissements de santé à identifier les
              profils adaptés à leurs besoins.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#medecins"
                className="rounded-full bg-[#60d5ca] px-7 py-3.5 text-center font-semibold text-[#082a43] shadow-lg transition hover:bg-[#83e3da]"
              >
                Je suis médecin
              </a>

              <a
                href="#etablissements"
                className="rounded-full border border-white/30 bg-white/[0.08] px-7 py-3.5 text-center font-semibold text-white transition hover:bg-white/15"
              >
                Je recrute un médecin
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                <span className="text-[#60d5ca]">
                  <CheckIcon />
                </span>
                Suivi personnalisé
              </span>

              <span className="flex items-center gap-2">
                <span className="text-[#60d5ca]">
                  <CheckIcon />
                </span>
                Double expertise France–Roumanie
              </span>

              <span className="flex items-center gap-2">
                <span className="text-[#60d5ca]">
                  <CheckIcon />
                </span>
                Accompagnement humain
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="rounded-[2rem] border border-white/20 bg-white/[0.1] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-white p-6 text-[#102435] sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#118c87]">
                      Parcours CSTMed
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-[#082a43]">
                      Un projet, un accompagnement
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#e5f7f5] px-3 py-1.5 text-xs font-semibold text-[#0c7773]">
                    France
                  </span>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    "Étude du projet professionnel",
                    "Identification des opportunités",
                    "Préparation des entretiens",
                    "Accompagnement administratif",
                    "Suivi de l’intégration",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#118c87] text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#082a43] p-5 text-white">
                  <p className="text-sm text-slate-300">
                    Vous avez un projet professionnel en France ?
                  </p>
                  <p className="mt-1 font-semibold">
                    Échangeons sur votre parcours.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-5 hidden rounded-2xl bg-white px-5 py-4 text-[#102435] shadow-xl sm:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Accompagnement
              </p>
              <p className="mt-1 font-bold text-[#118c87]">
                Humain et personnalisé
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="medecins"
        className="scroll-mt-24 bg-[#f5f9fb] px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
              Deux besoins, un même partenaire
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#082a43] sm:text-4xl">
              CSTMed vous accompagne à chaque étape
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Une approche claire et personnalisée, aussi bien pour les
              candidats que pour les établissements de santé.
            </p>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f7f5] text-2xl">
                🩺
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-[#118c87]">
                Pour les médecins
              </p>

              <h3 className="mt-3 text-2xl font-bold text-[#082a43] sm:text-3xl">
                Construisez votre projet professionnel en France
              </h3>

              <p className="mt-5 leading-7 text-slate-600">
                Nous étudions votre parcours, vos attentes et votre
                disponibilité afin de vous proposer un accompagnement adapté.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  "Étude personnalisée de votre profil",
                  "Accès à des opportunités correspondant à votre spécialité",
                  "Préparation des entretiens",
                  "Aide dans les démarches administratives",
                  "Suivi avant et après la prise de poste",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-700"
                  >
                    <span className="mt-0.5 text-[#118c87]">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:contact@cstmed.fr?subject=Candidature%20médecin%20CSTMed"
                className="mt-8 inline-flex rounded-full bg-[#118c87] px-6 py-3 font-semibold text-white transition hover:bg-[#0c7773]"
              >
                Déposer mon CV
              </a>
            </article>

            <article
              id="etablissements"
              className="scroll-mt-28 rounded-[2rem] bg-[#082a43] p-7 text-white shadow-xl sm:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                🏥
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-[#65d9ce]">
                Pour les établissements
              </p>

              <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                Identifiez des médecins correspondant à vos besoins
              </h3>

              <p className="mt-5 leading-7 text-slate-300">
                Nous vous accompagnons depuis l’analyse du besoin jusqu’à
                l’intégration du candidat sélectionné.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  "Analyse du poste et du besoin médical",
                  "Présélection de profils adaptés",
                  "Vérification des informations professionnelles",
                  "Organisation des entretiens",
                  "Accompagnement jusqu’à l’intégration",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-100"
                  >
                    <span className="mt-0.5 text-[#65d9ce]">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:contact@cstmed.fr?subject=Recherche%20de%20médecins%20CSTMed"
                className="mt-8 inline-flex rounded-full bg-[#65d9ce] px-6 py-3 font-semibold text-[#082a43] transition hover:bg-[#86e3da]"
              >
                Demander des profils
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
              Notre expertise
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#082a43] sm:text-4xl">
              Un accompagnement structuré et transparent
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.number}
                className="rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-[#9fded8] hover:shadow-lg"
              >
                <span className="text-sm font-bold text-[#118c87]">
                  {service.number}
                </span>
                <h3 className="mt-5 text-xl font-bold text-[#082a43]">
                  {service.title}
                </h3>
                <p className="mt-4 leading-7 text-slate-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="methode"
        className="scroll-mt-24 bg-[#082a43] px-5 py-20 text-white sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#65d9ce]">
                Notre méthode
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Un processus simple, de la première prise de contact à
                l’intégration
              </h2>
              <p className="mt-6 max-w-xl leading-8 text-slate-300">
                Chaque projet est étudié individuellement afin de construire
                une collaboration durable entre le médecin et
                l’établissement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {processSteps.map((item) => (
                <article
                  key={item.step}
                  className="rounded-3xl border border-white/10 bg-white/[0.07] p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#65d9ce] font-bold text-[#082a43]">
                    {item.step}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="offres"
        className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#118c87]">
                Spécialités médicales
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#082a43] sm:text-4xl">
                Des opportunités dans de nombreuses spécialités
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Les besoins évoluent selon les établissements partenaires et
                les régions. Contactez-nous pour connaître les opportunités
                correspondant à votre profil.
              </p>

              <a
              href="/offres"
              className="mt-7 inline-flex rounded-full border border-[#118c87] px-6 py-3 font-semibold text-[#118c87] transition hover:bg-[#e5f7f5]"
            >
              Découvrir les opportunités
            </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {specialties.map((specialty) => (
                <div
                  key={specialty}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fbfc] px-5 py-4 font-medium text-slate-700"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#118c87]" />
                  {specialty}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0b3a59] to-[#118c87] px-7 py-12 text-white shadow-xl sm:px-12 sm:py-16">
          <div className="grid gap-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8ce1d8]">
                Parlons de votre projet
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                Vous êtes médecin ou vous représentez un établissement de
                santé ?
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-slate-200">
                Contactez CSTMed pour un premier échange confidentiel et
                personnalisé.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href="mailto:contact@cstmed.fr"
                className="rounded-full bg-white px-7 py-3.5 text-center font-semibold text-[#082a43] transition hover:bg-slate-100"
              >
                contact@cstmed.fr
              </a>

              <a
                href="tel:+33628262576"
                className="rounded-full border border-white/30 px-7 py-3.5 text-center font-semibold transition hover:bg-white/10"
              >
                +33 (0) 6 28 26 25 76
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#061f33] px-5 py-12 text-slate-300 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <p className="text-2xl font-bold text-white">
              CST<span className="text-[#65d9ce]">Med</span>
            </p>
            <p className="mt-3 max-w-sm leading-7">
              Recrutement de médecins et accompagnement des établissements de
              santé en France.
            </p>
          </div>

          <div>
            <p className="font-bold text-white">Navigation</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a href="#medecins" className="hover:text-white">
                Médecins
              </a>
              <a href="#etablissements" className="hover:text-white">
                Établissements
              </a>
              <a href="#methode" className="hover:text-white">
                Notre méthode
              </a>
              <a href="#contact" className="hover:text-white">
                Contact
              </a>
            </div>
          </div>

          <div>
            <p className="font-bold text-white">Contact</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="mailto:contact@cstmed.fr"
                className="hover:text-white"
              >
                contact@cstmed.fr
              </a>
              <a href="tel:+33628262576" className="hover:text-white">
                +33 (0) 6 28 26 25 76
              </a>
              <span>France – Europe</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CSTMed. Tous droits réservés.</p>

          <div className="flex gap-5">
            <span>Mentions légales</span>
            <span>Politique de confidentialité</span>
          </div>
        </div>
      </footer>
    </main>
  );
}