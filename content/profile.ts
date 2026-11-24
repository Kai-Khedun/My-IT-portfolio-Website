// Copy deck: PORTFOLIO_BRIEF.md §9. Use as written; gaps are TODO(kai), listed in TODO-KAI.md.

export const profile = {
  name: "Kaiyur Khedun",
  role: "Backend Developer",
  location: "Durban, South Africa",
  coords: "29.86°S 31.02°E",
  // Rendered uppercase on the intro; kept in sentence case so screen readers say "APIs", not "A-P-I-S".
  tagline: "Backend developer from Durban. I build the APIs, databases and pipelines behind the app.",
  github: "https://github.com/Kai-Khedun",
};

export const about = {
  lead: "I'm Kai. I studied marketing, then computer science, and now I build the part of the product nobody sees.",
  paragraphs: [
    "My first degree was a BCom in Marketing Management, which I finished with distinction in 2023. It taught me to start with the customer: who's ordering, what they expect to happen when they press the button, and what brings them back. I then went back for a degree in computer science and application development (BCAD), which I finished in 2026, and I've completed Google's IT Support certificate and a Control4 automation certificate too.",
    "Most of my work sits behind the screen. I design schemas, write APIs, set up auth and build the pipelines that test and ship every change. I like rules that live in the database, where nobody can skip them, and a main branch nobody can push to without a review.",
    "This year I led three team builds with the same crew of four, including a full ordering, booking and shop platform for a real restaurant in Durban. I also tutor other students and put together setup kits so they can start coding on day one.",
  ],
  specs: [
    ["Focus", "Backend architecture, APIs, CI/CD"],
    ["Languages", "C#, Kotlin, JavaScript, TypeScript, SQL, Luau"],
    ["Frameworks", ".NET / ASP.NET Core, Node.js + Express, Next.js, React, Expo, Ktor"],
    ["Data", "PostgreSQL, Supabase, Firestore, MongoDB"],
    ["Shipping", "GitHub Actions, Vercel, Azure, Expo EAS"],
    ["Based", "Durban, South Africa (UTC+2)"],
  ] as const,
};

export const alsoBuilt = [
  {
    name: "Smart-X Gateway",
    what: "IoT telemetry ingestion and validation, from a practice brief I wrote myself",
    stack: ".NET · React · Vite",
    status: "Lab",
  },
  {
    name: "Durban Leak Tracker",
    what: "A city-wide way to report and track water leaks",
    stack: "Planning",
    status: "Concept",
  },
  {
    name: "Data structures in C#",
    what: "Stack, queue, priority queue, hash table and tree written from scratch, each driving a small app",
    stack: "C# · .NET · WPF",
    status: "Coursework",
  },
];

export const cvTeaser = {
  line: "Education, projects and skills on one page, ready to read.",
  rows: [
    ["BCAD, application development", "2026"],
    ["BCom, Marketing Management (distinction)", "2023"],
    ["Google IT Support · Control4 Automation", "Certificates"],
    ["Capri: Best Design, Solution and Presentation", "2026"],
  ] as const,
};

export const contact = {
  copy: "Need a backend built, a pipeline set up, or a team that needs a lead? I'm in Durban on South African time, and I'd like to hear about it.",
  // TODO(kai): email address. Shown as selectable text with a copy button once set.
  email: "",
  // TODO(kai): LinkedIn URL. Only links that exist are rendered.
  links: [{ label: "GitHub", href: profile.github, text: "github.com/Kai-Khedun" }],
};
