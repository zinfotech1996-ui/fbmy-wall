import { cn } from "@/lib/utils"

const PALETTES = [
  ["#5b7bd5", "#3b5998"],
  ["#7f9f6f", "#4f7241"],
  ["#c58b5a", "#96603a"],
  ["#a57bb5", "#724c86"],
  ["#5f9aa8", "#3f7280"],
  ["#c07070", "#8e4646"],
  ["#8a86b8", "#5b5788"],
  ["#6f8f9f", "#47656f"],
]

function hash(input: string): number {
  let value = 0
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) | 0
  }
  return Math.abs(value)
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function InitialsAvatar({
  name,
  seed,
  palette,
  className,
  title,
}: {
  name: string
  seed?: string
  palette?: number
  className?: string
  title?: string
}) {
  const index =
    typeof palette === "number"
      ? palette % PALETTES.length
      : hash(seed ?? name) % PALETTES.length
  const colors = PALETTES[index]

  return (
    <span
      aria-hidden={title ? undefined : true}
      title={title}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-[4px] font-bold text-white ring-1 ring-black/10 [text-shadow:0_1px_1px_rgba(0,0,0,0.25)]",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(150deg, ${colors[0]}, ${colors[1]})`,
      }}
    >
      {initials(name)}
    </span>
  )
}
