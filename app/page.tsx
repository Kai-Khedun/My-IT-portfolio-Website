import Link from "next/link";
import { Clock } from "@/components/Clock";
import { CopyButton } from "@/components/CopyButton";
import { ProjectCard } from "@/components/Ring/ProjectCard";
import { ProjectRing } from "@/components/Ring/ProjectRing";
import { World } from "@/components/World/World";
import { about, alsoBuilt, contact, cvTeaser, profile } from "@/content/profile";
import { projects } from "@/content/projects";

export default function Home() {
  return (
    <>
      <World />
      <Hero />
      <About />
      <Work />
      <AlsoBuilt />
      <CvTeaser />
      <Contact />
    </>
  );
}

/** Small section label: number, English, and a Japanese subtitle (decorative). */
function Label({ n, en, jp }: { n: string; en: string; jp: string }) {
  return (
    <p className="label">
      <span className="label-n">{n}</span>
      <span>{en}</span>
      <span className="label-jp" lang="ja" aria-hidden="true">
        {jp}
      </span>
    </p>
  );
}

function Hero() {
  const [first, last] = profile.name.split(" ");
  return (
    <section className="hero" id="top" aria-labelledby="name">
      <div className="wrap hero-in">
        <p className="hero-kicker">
          <span className="spark" aria-hidden="true">
            ✦
          </span>
          <span lang="ja" aria-hidden="true">
            ポートフォリオ
          </span>
          <span>Portfolio 2026</span>
        </p>
        <h1 className="hero-name" id="name" aria-label={profile.name}>
          <span className="line" aria-hidden="true">
            <span>{first}</span>
          </span>
          <span className="line" aria-hidden="true">
            <span className="it">{last}</span>
          </span>
        </h1>
        <p className="hero-tag">{profile.tagline}</p>
      </div>
      <div className="wrap hero-foot">
        <span className="loc">
          Durban · <Clock /> SAST
        </span>
        <span className="cue">
          Scroll to drive <i aria-hidden="true" />
        </span>
        <Link href="/cv">Read my CV ↗</Link>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="sec about" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <div className="panel about-panel">
          <Label n="01" en="About" jp="自己紹介" />
          <h2 className="h2" id="about-title">
            About
          </h2>
          <p className="lead">{about.lead}</p>
          <div className="prose">
            {about.paragraphs.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <dl className="specs">
            {about.specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <ProjectRing
        head={
          <>
            <Label n="02" en="Work" jp="作品" />
            <h2 className="h2" id="work-title">
              Selected <em>work</em>
            </h2>
          </>
        }
        titles={projects.map((p) => p.title)}
        cards={projects.map((p, i) => (
          <ProjectCard key={p.slug} p={p} i={i} />
        ))}
      />
    </section>
  );
}

function AlsoBuilt() {
  return (
    <section className="sec also" aria-labelledby="also-title">
      <div className="wrap">
        <div className="panel also-panel">
          <h2 className="h3" id="also-title">
            Also built
          </h2>
          <ul className="also-list">
            {alsoBuilt.map((r) => (
              <li key={r.name}>
                <div>
                  <p className="also-name">{r.name}</p>
                  <p className="also-what">{r.what}</p>
                </div>
                <p className="also-meta">
                  <span>{r.stack}</span>
                  <span className="tag">{r.status}</span>
                </p>
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
    <section className="sec cvt" id="cv" aria-labelledby="cv-title">
      <div className="wrap">
        <div className="panel cvt-panel">
          <Label n="03" en="Curriculum vitae" jp="履歴書" />
          <h2 className="h2" id="cv-title">
            CV
          </h2>
          <p className="cvt-line">{cvTeaser.line}</p>
          <ul className="cvt-list">
            {cvTeaser.rows.map(([a, b]) => (
              <li key={a}>
                <span>{a}</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link className="btn" href="/cv">
            Open my CV <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="sec contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact-in">
        <Label n="04" en="Contact" jp="連絡" />
        <h2 className="big" id="contact-title">
          Let&apos;s <em>talk</em>
        </h2>
        <p className="contact-copy">{contact.copy}</p>
        <div className="ctas">
          <Link className="btn" href="/cv">
            Read my CV
          </Link>
          <a className="btn btn-plain" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
        <ul className="links">
          {contact.email && (
            <li className="email">
              <span className="addr">{contact.email}</span>
              <CopyButton text={contact.email} />
            </li>
          )}
          {contact.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                <span>{l.label}</span>
                <span className="links-text">
                  {l.text} <span aria-hidden="true">↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
