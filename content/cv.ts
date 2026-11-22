// CV (brief §9.8).

export const cv = {
  name: "Kaiyur Khedun",
  role: "Backend Developer",
  location: "Durban, South Africa",
  // TODO(kai): contact line for the CV header (email / phone / links).
  contactLine: "",
  profile:
    "Backend developer with a BCom in Marketing and a degree in Computer Science (2026). I build APIs, database schemas and CI/CD pipelines, and this year I led a four-person team through three full builds, including an ordering, booking and shop platform for a Durban restaurant. I like systems that behave in production: business rules enforced in the database, and every change through a reviewed pull request and a green pipeline.",
  projects: [
    {
      name: "Capri Pizza Kitchen",
      when: "Jun – Nov 2026",
      sub: "Backend lead and team lead · client project",
      points: [
        "Built the full backend for food ordering, pool-table bookings and a pro shop, shared by a website, an iOS and Android app and an owner dashboard.",
        "Designed a hybrid schema: PostgreSQL (13 tables) for prices, bookings and stock; Firestore (4 collections) for carts, live order tracking and audit logs.",
        "Enforced business rules in the database with an exclusion constraint against double bookings, conditional stock updates against overselling, and row-level security.",
        "Set up CI/CD on GitHub Actions with pull-request review and required checks, deploying to Vercel and Expo EAS.",
      ],
    },
    {
      name: "CURBSIDE",
      when: "2026",
      sub: "Team lead · Android game prototype",
      points: [
        "Led a team of four from research to prototype on a car-spotting collection game.",
        "Designed the catch mechanics maths, the REST API and the UML for a Kotlin (Ktor) server on Azure.",
      ],
    },
    {
      name: "HustleHub+",
      when: "2026",
      sub: "Team lead · secure web platform",
      points: [
        "Freelance marketplace on Node.js, Express, React and MongoDB, built in three increments: secure backend, full-stack app, then DevSecOps and monitoring.",
      ],
    },
    {
      name: "DailyClicker",
      when: "2026",
      sub: "Solo · personal tool",
      points: [
        "Daily dashboard that opens on PC startup with tasks, goals, a quote and an inbox scan; installable on iPhone and works offline.",
      ],
    },
  ],
  education: [
    { name: "Computer Science", detail: "The IIE, South Africa · 2026" },
    // TODO(kai): BCom institution + year.
    { name: "BCom in Marketing", detail: "First degree" },
  ],
  certificate: { name: "IT Support Professional Certificate", detail: "Google" },
  skills: [
    ["Backend", "C#, .NET, ASP.NET Core, Node.js, Express, Kotlin (Ktor)"],
    ["Data", "PostgreSQL, Supabase, Firestore, MongoDB"],
    ["Frontend", "React, Next.js, Expo / React Native, WPF"],
    ["DevOps", "GitHub Actions, Vercel, Azure, Expo EAS, Git workflow"],
    ["Design", "REST APIs, UML, data structures in C#"],
  ] as const,
  also: "Tutor other students and build setup kits to get them coding.",
};
