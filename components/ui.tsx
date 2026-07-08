import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  titel,
  sub,
  children,
}: {
  titel: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl text-moss-deep">{titel}</h1>
        {sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-sage/60 bg-paper p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const buttonStyles = {
  primary:
    "inline-flex items-center gap-1.5 rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-deep",
  ghost:
    "inline-flex items-center gap-1.5 rounded-lg border border-sage px-4 py-2 text-sm font-semibold text-moss-deep transition hover:bg-sage-light",
  danger:
    "inline-flex items-center gap-1.5 rounded-lg border border-clay-deep/40 px-4 py-2 text-sm font-semibold text-clay-deep transition hover:bg-clay-soft",
  klein:
    "inline-flex items-center gap-1 rounded-md border border-sage px-2 py-1 text-xs font-semibold text-moss-deep transition hover:bg-sage-light",
};

export function Button({
  children,
  variant = "primary",
  type = "submit",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: keyof typeof buttonStyles;
  type?: "submit" | "button";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${buttonStyles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonStyles;
}) {
  return (
    <Link href={href} className={buttonStyles[variant]}>
      {children}
    </Link>
  );
}

const badgeTints = {
  sage: "bg-sage-light text-moss-deep",
  moss: "bg-moss text-white",
  clay: "bg-clay-soft text-clay-deep",
  clayDeep: "bg-clay text-white",
  water: "bg-water/60 text-moss-night",
  sand: "bg-sand text-wood",
  grijs: "bg-cream text-ink-soft border border-sage/60",
};

export type BadgeTint = keyof typeof badgeTints;

export function Badge({
  children,
  tint = "sage",
}: {
  children: ReactNode;
  tint?: BadgeTint;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTints[tint]}`}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  waarde,
  sub,
}: {
  label: string;
  waarde: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <p className="text-sm font-semibold text-ink-soft">{label}</p>
      <p className="mt-1 font-heading text-4xl text-moss-deep">{waarde}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </Card>
  );
}

export function EmptyState({
  titel,
  tekst,
  children,
}: {
  titel: string;
  tekst?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-sage bg-paper/60 p-10 text-center">
      <p className="font-heading text-xl text-moss-deep">{titel}</p>
      {tekst && <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{tekst}</p>}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  );
}

/** Kleurcode voor "laatst gecheckt": groen onder 3 maanden, oranje ouder. */
export function TrafficLight({
  kleur,
  titel,
}: {
  kleur: "groen" | "oranje";
  titel?: string;
}) {
  return (
    <span
      title={titel}
      className={`inline-block h-3 w-3 rounded-full ${
        kleur === "groen" ? "bg-moss" : "bg-clay"
      }`}
      aria-label={kleur === "groen" ? "Recent gecheckt" : "Meer dan 3 maanden geleden gecheckt"}
    />
  );
}

export function Veld({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
