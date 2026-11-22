import Image from "next/image";
import Link from "next/link";
import { Diagram } from "@/components/Diagram";
import { cardMeta, dwg, type Project } from "@/content/projects";
import { publicFile } from "@/lib/publicFile";

/** Cover: screenshot if public/work/<slug>/cover.webp exists, else the first diagram, else a monogram. */
export function Cover({ p }: { p: Project }) {
  // TODO(kai): screenshots at public/work/<slug>/cover.webp replace the diagram covers.
  const shot = publicFile(`/work/${p.slug}/cover.webp`);
  if (shot) return <Image src={shot} alt="" fill sizes="(min-width: 1024px) 420px, 80vw" className="object-cover" />;
  if (p.figures[0]) return <Diagram id={p.figures[0].diagram} decorative />;
  return (
    <div className="monogram" aria-hidden="true">
      <span>{p.monogram}</span>
    </div>
  );
}

export function ProjectCard({ p, i }: { p: Project; i: number }) {
  const extra = p.stack.length - 3;
  return (
    <article className="card">
      <div className="card-top mono">
        <span className="dwg">{dwg(i)}</span>
        <span className="status">{p.status}</span>
      </div>
      <div className="card-cover">
        <Cover p={p} />
      </div>
      <h3 className="card-title">
        <Link className="card-link" href={`/work/${p.slug}`}>
          {p.title}
        </Link>
      </h3>
      <p className="card-line">{p.line}</p>
      <p className="mono">{cardMeta(p)}</p>
      <ul className="chips" aria-label="Stack">
        {p.stack.slice(0, 3).map((s) => (
          <li className="chip" key={s}>
            {s}
          </li>
        ))}
        {extra > 0 && (
          <li className="chip" aria-label={`and ${extra} more`}>
            +{extra}
          </li>
        )}
      </ul>
      <span className="card-cta" aria-hidden="true">
        Open case study →
      </span>
    </article>
  );
}
