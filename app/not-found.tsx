import Link from "next/link";
import { SheetHead } from "@/components/SheetHead";

export default function NotFound() {
  return (
    <section className="sheet lost">
      <div className="wrap">
        <SheetHead left="404 · Missing sheet" right="Sheet ?? of 05" />
        <h1 className="big">Sheet not found</h1>
        <div className="ctas mt-10">
          <Link className="btn btn-solid" href="/">
            <span className="arr" aria-hidden="true">
              ←
            </span>{" "}
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
