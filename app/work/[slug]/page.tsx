import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Diagram } from "@/components/Diagram";
import { Cover } from "@/components/Ring/ProjectCard";
import { projects } from "@/content/projects";

export const dynamicParams = false; // only the six projects exist; anything else is a 404

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.line } : {};
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function CasePage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <article className="case">
      <div className="wrap">
        <Link className="pill case-back" href="/#work">
          <span aria-hidden="true">←</span> All work
        </Link>
        <header className="case-head">
          <p className="label">
            <span className="label-n">{pad(i + 1)}</span>
            <span>{p.type}</span>
          </p>
          <h1 className="case-title">{p.title}</h1>
          <p className="case-line">{p.line}</p>
          <ul className="case-meta">
            <li>{p.role}</li>
            <li>{p.when}</li>
            <li className="tag">
              <span aria-hidden="true">✦ </span>
              {p.status}
            </li>
          </ul>
          {p.award && (
            <p className="case-award">
              <span aria-hidden="true">✦ </span>
              {p.award}
            </p>
          )}
          {p.links.length > 0 && (
            <div className="ctas">
              {p.links.map((l, k) => (
                <a key={l.href} className={k === 0 ? "btn" : "btn btn-plain"} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="case-cover">
          <Cover p={p} />
        </div>

        <div className="case-grid">
          <div className="case-body">
            <p className="case-summary">{p.summary}</p>
            {p.built.length > 0 && (
              <section>
                <h2 className="case-h">What I built</h2>
                <ul className="built">
                  {p.built.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <aside className="case-side">
            <h2 className="case-h">Stack</h2>
            <ul className="chips">
              {p.stack.map((s) => (
                <li className="chip" key={s}>
                  {s}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {p.figures.length > 0 && (
          <div className="figs">
            {p.figures.map((f) => (
              <figure className="fig" key={f.diagram}>
                <div className="fig-scroll">
                  <Diagram id={f.diagram} />
                </div>
                <figcaption>
                  <span>{f.label}</span>
                  <span className={f.hot ? "hot" : undefined}>{f.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <nav className="next-proj" aria-label="Next project">
          <Link href={`/work/${next.slug}`}>
            <span className="label">Next project →</span>
            <span className="next-title">{next.title}</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
