import Link from "next/link";

export default function NotFound() {
  return (
    <section className="lost">
      <div className="wrap">
        <p className="label">
          <span className="label-n">404</span>
          <span>Not found</span>
        </p>
        <h1 className="big">
          Wrong <em>turn</em>
        </h1>
        <p className="lost-copy">This page doesn&apos;t exist.</p>
        <div className="ctas">
          <Link className="btn" href="/">
            <span aria-hidden="true">←</span> Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
