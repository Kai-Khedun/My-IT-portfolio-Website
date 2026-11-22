/** Mono row that opens every sheet: "02 · About" on the left, "Sheet 02 of 05" on the right. */
export function SheetHead({ left, right }: { left: string; right: string }) {
  return (
    <div className="sheet-head mono">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
