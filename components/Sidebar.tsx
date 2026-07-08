"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

const items = [
  { href: "/dashboard", label: "Dashboard", icoon: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" },
  { href: "/klanten", label: "Klanten", icoon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" },
  { href: "/projecten", label: "Projecten", icoon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { href: "/ontwerpstudio", label: "Ontwerpstudio", icoon: "M4 20l4-1L20 7a2 2 0 00-3-3L5 16l-1 4zM14 6l3 3" },
  { href: "/subsidies", label: "Subsidies", icoon: "M12 21a9 9 0 110-18 9 9 0 010 18zM15 9.5c-.6-1-1.7-1.5-3-1.5-1.8 0-3 1-3 2s.8 1.7 3 2c2.2.3 3 1 3 2s-1.2 2-3 2c-1.3 0-2.4-.5-3-1.5M12 6.5v11" },
  { href: "/educatie", label: "Educatie", icoon: "M4 19V6a2 2 0 012-2h13v13H6a2 2 0 00-2 2zm0 0a2 2 0 002 2h13" },
  { href: "/bibliotheek", label: "Bibliotheek", icoon: "M4 4h4v16H4zM10 4h4v16h-4zM17 5l4 15-4 1-3-15z" },
  { href: "/instellingen", label: "Instellingen", icoon: "M12 15a3 3 0 100-6 3 3 0 000 6zm7-3a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2L14 21h-4l-.5-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 015 12a7 7 0 01.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L10 3h4l.5 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.06.4.1.8.1 1.2z" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print flex w-60 shrink-0 flex-col bg-moss-night text-sage-light">
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="text-2xl" aria-hidden>
          🌿
        </span>
        <div>
          <p className="font-heading text-xl leading-tight text-white">De Kas</p>
          <p className="text-[11px] uppercase tracking-wider text-sage/80">
            Boulder Bloem
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Hoofdnavigatie">
        {items.map((item) => {
          const actief =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={actief ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                actief
                  ? "bg-moss text-white"
                  : "text-sage-light hover:bg-moss-deep hover:text-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={item.icoon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={logout} className="px-3 py-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-sage-light transition hover:bg-moss-deep hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          Uitloggen
        </button>
      </form>
    </aside>
  );
}
