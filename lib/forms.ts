/** Hulpjes om FormData naar schone waarden te vertalen (lege string = null). */

export function tekst(fd: FormData, naam: string): string {
  return String(fd.get(naam) ?? "").trim();
}

export function tekstOfNull(fd: FormData, naam: string): string | null {
  const v = tekst(fd, naam);
  return v === "" ? null : v;
}

export function getalOfNull(fd: FormData, naam: string): number | null {
  const v = tekst(fd, naam);
  if (v === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

export function datumOfNull(fd: FormData, naam: string): Date | null {
  const v = tekst(fd, naam);
  if (v === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function aangevinkt(fd: FormData, naam: string): boolean {
  return fd.get(naam) === "on" || fd.get(naam) === "true";
}
