import type { Metadata } from "next";
import Link from "next/link";
import { CvSheet } from "@/components/CvSheet";
import { PrintButton } from "@/components/PrintButton";
import { publicFile } from "@/lib/publicFile";

export const metadata: Metadata = {
  title: "CV",
  description: "Education, projects and skills on one page, ready to read.",
};

export default function CvPage() {
  // TODO(kai): drop the PDF at public/cv/Kaiyur-Khedun-CV.pdf and the Download button appears.
  const pdf = publicFile("/cv/Kaiyur-Khedun-CV.pdf");
  return (
    <div className="cv-page">
      <div className="cv-bar">
        <Link className="pill" href="/">
          <span aria-hidden="true">←</span> Back
        </Link>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          {pdf && (
            <a className="pill" href={pdf} download>
              Download PDF
            </a>
          )}
        </div>
      </div>
      <CvSheet />
    </div>
  );
}
