import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover } from "@/components/ArcCarousel/ProjectCard";
import { Diagram } from "@/components/Diagram";
import { SheetHead } from "@/components/SheetHead";
import { dwg, projects } from "@/content/projects";

export const dynamicParams = false; // only the six projects exist; anything else is a 404

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.line } : {};
}

export default async function CasePage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <article className="sheet case-page">
      <div className="wrap">
        <SheetHead left={`${dwg(i)} · ${p.type}`} right={`Sheet 03.${i + 1}`} />
        <header className="case-head">
          <h1 className="case-title">{p.title}</h1>
          <p className="case-line">{p.line}</p>
          <p className="mono case-meta">
            {p.role} · {p.when} · {p.status}
          </p>
        </header>

        {p.links.length > 0 && (
          <ul className="ctas case-links">
            {p.links.map((l, k) => (
              <li key={l.href}>
                <a className={k === 0 ? "btn btn-solid" : "btn btn-ghost"} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}{" "}
                  <span className="arr" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="case-grid">
          <div className="case-body">
            <p>{p.summary}</p>
            {p.built.length > 0 && (
              <section>
                <h2 className="mono case-h">What I built</h2>
                <ul className="built">
                  {p.built.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="mono case-h">Stack</h2>
              <ul className="chips">
                {p.stack.map((s) => (
                  <li className="chip" key={s}>
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="figs">
            {p.figures.map((f) => (
              <figure className="fig crop" key={f.diagram}>
                <div className="fig-scroll">
                  <Diagram id={f.diagram} />
                </div>
                <figcaption>
                  <span className="mono">{f.label}</span>
                  <span className={f.hot ? "mono text-hot" : "mono"}>{f.note}</span>
                </figcaption>
              </figure>
            ))}
            {p.figures.length === 0 && (
              <div className="fig crop">
                <div className="cover-fig">
                  <Cover p={p} />
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="next-proj" aria-label="Next project">
          <Link href={`/work/${next.slug}`}>
            <span className="mono">Next project →</span>
            <span className="next-title">{next.title}</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
