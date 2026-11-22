import { cv } from "@/content/cv";

/** The paper CV. `preview` swaps headings for plain text (the scaled copy on the home page is decorative). */
export function CvSheet({ preview = false }: { preview?: boolean }) {
  const H1 = preview ? "p" : "h1";
  const H2 = preview ? "p" : "h2";
  const H3 = preview ? "p" : "h3";
  return (
    <article className="paper">
      <header className="p-head">
        <div>
          <H1 className="p-name">{cv.name}</H1>
          <p className="p-role">{cv.role}</p>
        </div>
        <p className="p-loc">
          {cv.location}
          {cv.contactLine && (
            <>
              <br />
              {cv.contactLine}
            </>
          )}
        </p>
      </header>
      <div className="p-grid">
        <div>
          <section className="p-sec">
            <H2 className="p-h">Profile</H2>
            <p>{cv.profile}</p>
          </section>
          <section className="p-sec">
            <H2 className="p-h">Projects</H2>
            {cv.projects.map((p) => (
              <div className="p-item" key={p.name}>
                <div className="p-row">
                  <H3 className="p-title">{p.name}</H3>
                  <span>{p.when}</span>
                </div>
                <p className="p-sub">{p.sub}</p>
                <ul className="p-list">
                  {p.points.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
        <aside className="p-side">
          <section className="p-sec">
            <H2 className="p-h">Education</H2>
            {cv.education.map((e) => (
              <div className="p-edu" key={e.name}>
                <b>{e.name}</b>
                <span>{e.detail}</span>
              </div>
            ))}
          </section>
          <section className="p-sec">
            <H2 className="p-h">Certificate</H2>
            <div className="p-edu">
              <b>{cv.certificate.name}</b>
              <span>{cv.certificate.detail}</span>
            </div>
          </section>
          <section className="p-sec">
            <H2 className="p-h">Skills</H2>
            <dl>
              {cv.skills.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="p-sec">
            <H2 className="p-h">Also</H2>
            <p>{cv.also}</p>
          </section>
        </aside>
      </div>
    </article>
  );
}
