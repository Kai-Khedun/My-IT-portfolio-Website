import { existsSync } from "node:fs";
import path from "node:path";

/** "/work/capri/cover.webp" if that file is in public/, otherwise undefined. Checked at build time. */
export function publicFile(href: string): string | undefined {
  return existsSync(path.join(process.cwd(), "public", href)) ? href : undefined;
}
