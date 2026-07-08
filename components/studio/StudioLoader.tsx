"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Konva werkt alleen in de browser; laad de studio zonder SSR.
const Studio = dynamic(() => import("./Studio"), {
  ssr: false,
  loading: () => (
    <p className="rounded-xl border border-sage/60 bg-paper p-10 text-center text-sm text-ink-soft">
      Ontwerpstudio laden...
    </p>
  ),
});

export default function StudioLoader(props: ComponentProps<typeof Studio>) {
  return <Studio {...props} />;
}
