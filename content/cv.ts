// CV for /cv and the downloadable PDF. Facts come from Kai: his certificates, the IIE programme schedule,
// the project write-ups and his GitHub repos. Gaps are TODO(kai) and listed in TODO-KAI.md; empty values
// are simply not printed.
import { contact, profile } from "./profile";

// TODO(kai): phone number for the CV header (optional; leave empty to hide it).
const phone: string = "";
// TODO(kai): switch to the custom domain once it's live.
const portfolio = "kai-portfolio-mocha.vercel.app";

type Link = { text: string; href?: string };
const linkedIn = contact.links.find((l) => l.label === "LinkedIn");

export const cv = {
  name: profile.name,
  role: "Backend Developer",
  contact: [
    { text: profile.location },
    contact.email ? { text: contact.email, href: `mailto:${contact.email}` } : null,
    phone ? { text: phone, href: `tel:${phone.replace(/\s/g, "")}` } : null,
    linkedIn ? { text: linkedIn.text, href: linkedIn.href } : null,
    { text: "github.com/Kai-Khedun", href: profile.github },
    { text: portfolio, href: `https://${portfolio}` },
  ].filter(Boolean) as Link[],

  summary:
    "Backend developer from Durban with a BCAD in application development and a BCom in Marketing Management, awarded with distinction. I build APIs, database schemas and CI/CD pipelines. In 2026 I led a team of four through three full builds, including an ordering, booking and shop platform for a Durban restaurant that won all three awards: Best Design, Best Solution and Best Presentation. I also tutor other students.",

  education: [
    {
      title: "Bachelor of Computer and Information Science in Application Development (BCAD)",
      school: "The Independent Institute of Education (The IIE)",
      when: "2026",
    },
    {
      title: "Bachelor of Commerce, Marketing Management",
      school: "The Independent Institute of Education (The IIE)",
      note: "Awarded with distinction",
      when: "2023",
    },
  ],

  skills: [
    // Languages: from the projects and Kai's GitHub repos. TODO(kai): add any others (e.g. Python, Java).
    ["Languages", "C#, Kotlin, JavaScript, TypeScript, SQL (PostgreSQL, PL/pgSQL), Luau, HTML, CSS, PowerShell"],
    ["Frameworks", ".NET / ASP.NET Core, Node.js, Express, Next.js, React, Expo / React Native, Ktor, WPF"],
    ["Data", "PostgreSQL, Supabase, Firestore, MongoDB"],
    ["DevOps & cloud", "GitHub Actions, Vercel, Azure, Expo EAS, Git (pull-request workflow)"],
    ["Design & AI", "REST APIs, UML, data structures, LoRA / QLoRA fine-tuning"],
  ] as const,

  projects: [
    {
      name: "Capri Pizza Kitchen",
      sub: "Client project · backend lead and team lead",
      when: "Jun – Nov 2026",
      stack: "Supabase, PostgreSQL, Firestore, Next.js, Expo, GitHub Actions, Vercel",
      award: "Won all three awards: Best Design, Best Solution and Best Presentation",
      points: [
        "Built the entire backend for ordering, pool-table bookings and a pro shop, shared by a website, an iOS and Android app and an owner dashboard.",
        "Designed a hybrid data model (13 PostgreSQL tables, 4 Firestore collections) with rules enforced in the database: no double bookings, no overselling, row-level security.",
        "Set up CI/CD on GitHub Actions with reviewed pull requests and required checks, deploying to Vercel and Expo EAS.",
      ],
    },
    {
      name: "CURBSIDE",
      sub: "Android game prototype · team lead",
      when: "2026",
      stack: "Kotlin, Ktor, Android, Azure",
      points: [
        "Led a team of four from research to a working prototype of a car-spotting collection game.",
        "Owned the catch maths, designed the REST API and UML for a Ktor server on Azure, and built the vehicle detail screen.",
      ],
    },
    {
      name: "HustleHub+",
      sub: "Secure freelance marketplace · team lead",
      when: "2026",
      stack: "Node.js, Express, React, MongoDB",
      points: [
        "Led a team of four through three increments: secure backend, full MERN app, then DevSecOps and monitoring.",
      ],
    },
    {
      name: "DailyClicker",
      sub: "Personal tool · solo",
      when: "2026",
      stack: "Web app, offline-ready, installs on iPhone",
      points: ["A morning dashboard that opens with my PC: tasks, goals, a quote and an inbox scan that flags what actually matters."],
    },
  ],

  // Smaller projects, one line each.
  more: [
    { name: "Jester King", what: "AI lab: a small open language model fine-tuned with LoRA, running on my own hardware", when: "2026" },
    // TODO(kai): what you built on Tetherfall.
    { name: "Tetherfall", what: "Roblox extraction tycoon in Luau, co-developed with a friend", when: "2026" },
  ],

  certifications: [
    // TODO(kai): year completed.
    { title: "Google IT Support Professional Certificate", by: "Google", when: "" },
    // TODO(kai): exact certificate title and year.
    { title: "Control4 Automation Certificate", by: "Control4", when: "" },
  ],
};
