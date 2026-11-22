import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-in">
        <Link className="brand" href="/">
          <span className="brand-spark" aria-hidden="true">
            ✦
          </span>
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
        <ThemeToggle />
      </div>
    </header>
  );
}
