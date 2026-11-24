import { cv } from "@/content/cv";

/** The paper CV: one column, standard headings, text that copies and parses cleanly (also the PDF source). */
export function CvSheet() {
  return (
    <article className="paper">
      <header className="cv-head">
        <h1 className="cv-name">{cv.name}</h1>
        <p className="cv-role">{cv.role}</p>
        <ul className="cv-contact">
          {cv.contact.map((c) => (
            <li key={c.text}>{c.href ? <a href={c.href}>{c.text}</a> : c.text}</li>
          ))}
        </ul>
      </header>

      <section className="cv-sec" aria-labelledby="cv-summary">
        <h2 className="cv-h" id="cv-summary">
          Profile
        </h2>
        <p>{cv.summary}</p>
      </section>

      <section className="cv-sec" aria-labelledby="cv-education">
        <h2 className="cv-h" id="cv-education">
          Education
        </h2>
        {cv.education.map((e) => (
          <div className="cv-item" key={e.title}>
            <div className="cv-row">
              <h3 className="cv-title">{e.title}</h3>
              <span className="cv-when">{e.when}</span>
            </div>
            <p className="cv-sub">
              {e.school}
              {e.note && <span className="cv-note"> · {e.note}</span>}
            </p>
          </div>
        ))}
      </section>

      <section className="cv-sec" aria-labelledby="cv-skills">
        <h2 className="cv-h" id="cv-skills">
          Skills
        </h2>
        <dl className="cv-skills">
          {cv.skills.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="cv-sec" aria-labelledby="cv-projects">
        <h2 className="cv-h" id="cv-projects">
          Projects
        </h2>
        {cv.projects.map((p) => (
          <div className="cv-item" key={p.name}>
            <div className="cv-row">
              <h3 className="cv-title">
                {p.name} <span className="cv-kind">· {p.sub}</span>
              </h3>
              <span className="cv-when">{p.when}</span>
            </div>
            <p className="cv-stack">{p.stack}</p>
            {"award" in p && p.award && <p className="cv-award">✦ {p.award}</p>}
            <ul className="cv-list">
              {p.points.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
        {cv.more.map((m) => (
          <div className="cv-row cv-line" key={m.name}>
            <p>
              <span className="cv-title">{m.name}</span> <span className="cv-kind">· {m.what}</span>
            </p>
            <span className="cv-when">{m.when}</span>
          </div>
        ))}
      </section>

      <section className="cv-sec" aria-labelledby="cv-certs">
        <h2 className="cv-h" id="cv-certs">
          Certifications
        </h2>
        {cv.certifications.map((c) => (
          <div className="cv-row cv-line" key={c.title}>
            <p>
              <span className="cv-title">{c.title}</span> <span className="cv-kind">· {c.by}</span>
            </p>
            {c.when && <span className="cv-when">{c.when}</span>}
          </div>
        ))}
      </section>
    </article>
  );
}
