const PALETTE = [
  "#2563eb", // blue
  "#4f46e5", // indigo
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#0d9488", // teal
  "#059669", // emerald
  "#0284c7", // sky
  "#9333ea", // purple
];

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const color = PALETTE[nameHash(name) % PALETTE.length];
  return (
    <div
      className={`grid place-items-center font-semibold text-white select-none ${className}`}
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
}
