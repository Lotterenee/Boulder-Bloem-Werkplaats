"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Opent de printdialoog na het laden; knoppen alleen op scherm zichtbaar. */
export default function PrintKnoppen({ activiteitId }: { activiteitId: string }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="no-print mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-deep"
      >
        🖨 Print / PDF
      </button>
      <Link
        href={`/educatie/activiteiten/${activiteitId}`}
        className="rounded-lg border border-sage px-4 py-2 text-sm font-semibold text-moss-deep transition hover:bg-sage-light"
      >
        ← Terug naar de les
      </Link>
    </div>
  );
}
