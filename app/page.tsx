import Link from "next/link";
import { ProjectCard } from "@/components/ArcCarousel/ProjectCard";
import { Clock } from "@/components/Clock";
import { CoilMark } from "@/components/CoilMark";
import { CopyButton } from "@/components/CopyButton";
import { CvSheet } from "@/components/CvSheet";
import { FitWidth } from "@/components/FitWidth";
import { SheetHead } from "@/components/SheetHead";
import { about, alsoBuilt, contact, cvTeaser, profile } from "@/content/profile";
import { projects } from "@/content/projects";

export default function Home() {
  return (
    <>
      <Intro />
      <About />
      <Work />
      <CvTeaser />
      <Contact />
    </>
  );
}

/* Sheet 01. Static frame for now; the WebGL intro arrives in Phase 3. */
function Intro() {
  return (
    <section className="hero" id="top" aria-labelledby="name">
      <div className="pin">
        <CoilMark className="hero-mark" />
        <div className="wrap pin-in">
          <div className="h-left">
            <h1 id="name">{profile.name}</h1>
            <p className="mono h-sub">
              <span>{"// Portfolio"}</span>
              <span>2026</span>
            </p>
          </div>
          <p className="h-right">{profile.tagline}</p>
          <div className="h-foot mono">
            <span className="loc">
              Durban · <Clock /> SAST
            </span>
            <span className="cue">
              Scroll <i aria-hidden="true" />
            </span>
            <Link href="/cv">Read my CV ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="sheet" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <SheetHead left="02 · About" right="Sheet 02 of 05" />
        <div className="about-grid">
          <div>
            <h2 className="sec-title mb-7" id="about-title">
              About
            </h2>
            <p className="lead">{about.lead}</p>
            <div className="prose">
              {about.paragraphs.map((t) => (
                <p key={t.slice(0, 24)}>{t}</p>
              ))}
            </div>
          </div>
          <dl className="specs" aria-label="Skills">
            {about.specs.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bom-wrap">
          <table className="bom">
            <caption className="mono">Parts list · qualifications</caption>
            <thead>
              <tr>
                <th className="mono" scope="col">
                  Item
                </th>
                <th className="mono" scope="col">
                  Qualification
                </th>
                <th className="mono" scope="col">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {about.qualifications.map((q) => (
                <tr key={q.item}>
                  <td>{q.item}</td>
                  <td className="q">{q.name}</td>
                  <td className="d">{q.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="sheet" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <SheetHead left="03 · Selected work" right="Sheet 03 of 05" />
        <h2 className="sec-title work-title" id="work-title">
          Selected work
        </h2>
        <ul className="work-grid" aria-label="Selected work">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard p={p} i={i} />
            </li>
          ))}
        </ul>
        <div className="index">
          <h3 className="mono">Also built</h3>
          <ul className="idx">
            {alsoBuilt.map((r) => (
              <li key={r.name}>
                <span className="n">{r.name}</span>
                <span className="w">{r.what}</span>
                <span className="mono s">{r.stack}</span>
                <span className="mono st">{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CvTeaser() {
  return (
    <section className="sheet" id="cv" aria-labelledby="cv-title">
      <div className="wrap">
        <SheetHead left="04 · Curriculum vitae" right="Sheet 04 of 05" />
        <div className="cv-grid">
          <div className="cv-copy">
            <h2 className="sec-title" id="cv-title">
              CV
            </h2>
            <p>{cvTeaser.line}</p>
            <ul className="cv-list">
              {cvTeaser.rows.map(([a, b]) => (
                <li key={a}>
                  <span>{a}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="ctas">
              <Link className="btn btn-solid" href="/cv">
                Open my CV{" "}
                <span className="arr" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>
          </div>
          {/* Same destination as the button above, so it's skipped by Tab. */}
          <Link className="cv-preview" href="/cv" aria-hidden="true" tabIndex={-1}>
            <FitWidth width={820}>
              <CvSheet preview />
            </FitWidth>
            <span className="open">Open CV ↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="sheet contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <SheetHead left="05 · Contact" right="Sheet 05 of 05" />
        <h2 className="big" id="contact-title">
          Let&apos;s talk
        </h2>
        <div className="contact-grid">
          <div>
            <p>{contact.copy}</p>
            <div className="ctas mt-6">
              <Link className="btn btn-solid" href="/cv">
                Read my CV
              </Link>
              <a className="btn btn-ghost" href="#top">
                Back to top{" "}
                <span className="arr" aria-hidden="true">
                  ↑
                </span>
              </a>
            </div>
          </div>
          <ul className="links">
            {contact.email && (
              <li className="email">
                <span className="mono">Email</span>
                <span className="addr">{contact.email}</span>
                <CopyButton text={contact.email} />
              </li>
            )}
            {contact.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}{" "}
                  <span className="mono">
                    {l.text} <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
