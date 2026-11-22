// Carousel cards + case study pages (brief §9.4), in this order.
import type { DiagramId } from "@/components/Diagram";

export type Figure = { diagram: DiagramId; label: string; note: string; hot?: boolean };

export type Project = {
  slug: string;
  type: string; // DWG line, e.g. "Client project"
  status: string; // status chip
  title: string;
  line: string;
  role: string;
  when: string;
  summary: string;
  built: string[]; // empty = section left out
  stack: string[];
  figures: Figure[];
  monogram?: string; // cover when there's no diagram
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "capri",
    type: "Client project",
    status: "Client project",
    title: "Capri Pizza Kitchen",
    line: "Ordering, bookings and a pro shop for a Durban restaurant",
    role: "Backend lead · team lead",
    when: "Jun – Nov 2026",
    summary:
      "Capri is a family-run wood-fire pizza and burger spot in Malvern, Durban, with a pool club and a pro shop under one roof. We built one platform for all three: a website, an iOS and Android app, and a dashboard the owner runs himself. I built the entire backend.",
    built: [
      "One backend shared by the website, the mobile app and the owner dashboard",
      "A hybrid data model: 13 PostgreSQL tables for anything that decides price or availability, 4 Firestore collections for carts, live order tracking and logs",
      "Rules enforced by the database itself: no double-booked pool tables, no overselling in the shop, and customers only ever see their own orders",
      "CI/CD on GitHub Actions. Every change goes through a pull request and a green pipeline before it reaches main",
      "Led the team of four and handled the build with the client",
    ],
    stack: ["Supabase", "PostgreSQL", "Firestore", "Next.js", "Expo", "GitHub Actions", "Vercel"],
    figures: [
      { diagram: "capri-system", label: "Fig. 3.1 · System overview", note: "Orange = built by me", hot: true },
      { diagram: "capri-pipeline", label: "Fig. 3.2 · Delivery pipeline", note: "No direct pushes to main" },
    ],
    // TODO(kai): live site URL (show prominently), plus repo links if public.
    links: [],
  },
  {
    // TODO(kai): confirm the name. The project folder is called "DailyLicker".
    slug: "dailyclicker",
    type: "Personal tool",
    status: "Personal tool",
    title: "DailyClicker",
    line: "A morning dashboard that opens when my PC does",
    role: "Solo · design and build",
    when: "2026",
    summary:
      "A personal check-in page in the style of heyclicky. When my PC switches on, it opens with today's tasks, my goals, a quote to read and a scan of my inbox that flags what actually matters.",
    built: [
      "Launches on startup, so the day starts on the plan instead of the inbox",
      "An inbox scan that surfaces the emails worth reading first",
      "Installs on my iPhone home screen and works offline and online",
    ],
    stack: ["Web app", "iPhone home screen", "Offline-ready"],
    figures: [{ diagram: "daily-boot", label: "Fig. 3.3 · Boot sequence", note: "Solo build" }],
    links: [],
  },
  {
    slug: "curbside",
    type: "Android game",
    status: "Prototype",
    title: "CURBSIDE",
    line: "Pokémon Go for people who stop and stare at cars",
    role: "Team lead · catch maths · API design",
    when: "2026",
    summary:
      "Spot a car in the street, scan it, and it lands in your garage with its real specs. Rare variants turn up by chance, some cars make you win a mini-game first, and the turbo you throw decides whether the catch sticks.",
    built: [
      "Led the team from research and planning through to the working prototype",
      "Own the catch maths: how a turbo's power and a car's rarity turn into catch odds",
      "Designed the REST API and the UML for a Kotlin (Ktor) server hosted on Azure",
      "Built the vehicle detail screen in the Android app",
    ],
    stack: ["Kotlin", "Ktor", "Android", "Azure"],
    figures: [
      { diagram: "curbside-monorepo", label: "Fig. 3.4 · Monorepo and catch model", note: "Orange = built by me", hot: true },
    ],
    links: [],
  },
  {
    slug: "hustlehub",
    type: "Web platform",
    status: "Team project",
    title: "HustleHub+",
    line: "A secure marketplace for freelancers",
    role: "Team lead",
    when: "2026",
    summary:
      "Freelancers list their services, clients browse and book them, and both sides get transaction records, income tracking and an estimate of the tax they owe. Security came first: the backend had to stand on its own before any UI existed.",
    built: [
      "Built in three increments: secure backend foundations, the full MERN app, then DevSecOps and monitoring",
      "Protected main branch. Every change needs a pull request and an approval",
      "Led the team of four across all three parts",
    ],
    stack: ["Node.js", "Express", "React", "MongoDB"],
    figures: [{ diagram: "hustle-plan", label: "Fig. 3.5 · Build plan and branch rules", note: "Team of four" }],
    links: [],
  },
  {
    slug: "tetherfall",
    type: "Roblox game",
    status: "In build",
    title: "Tetherfall",
    line: "An extraction tycoon on Roblox",
    role: "Co-developer",
    when: "2026",
    summary:
      "A Roblox extraction tycoon inspired by Pull a Lucky Fish and HELLHOLE, with its own twist. I'm building it with a friend who has already made much of the UI and art.",
    // TODO(kai): what you built on Tetherfall. Section stays hidden until filled in.
    built: [],
    stack: ["Roblox Studio", "Luau"],
    figures: [],
    monogram: "TF",
    links: [],
  },
  {
    slug: "jester-king",
    type: "AI lab",
    status: "Lab",
    title: "Jester King",
    line: "My own small language model, with a personality",
    role: "Solo",
    when: "2026",
    summary:
      "A small open model fine-tuned with LoRA to run on my own machine, with no API in the loop. Its persona is a jester king: it helps you, and roasts you while it does.",
    built: [
      "Chose fine-tuning (LoRA/QLoRA) over training from scratch or RAG",
      "Trains and runs locally on my own hardware",
    ],
    stack: ["LoRA", "QLoRA"],
    figures: [],
    monogram: "JK",
    links: [],
  },
];

