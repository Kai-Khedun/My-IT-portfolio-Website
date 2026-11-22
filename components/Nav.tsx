import Link from "next/link";

export function Nav() {
  return (
    <header className="nav solid">
      <div className="wrap nav-in">
        <Link className="brand" href="/">
          Kaiyur Khedun
        </Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/#work">Work</Link>
          <Link className="opt" href="/#about">
            About
          </Link>
          <Link href="/cv">CV</Link>
          <Link className="talk" href="/#contact">
            Let&apos;s talk
          </Link>
        </nav>
      </div>
    </header>
  );
}
