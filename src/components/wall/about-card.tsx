import { GlobeIcon } from "@/components/wall/icons"
import type { LiveState } from "@/lib/wall"
import { cn } from "@/lib/utils"

const STACK = [
  "React 19",
  "Next.js 16",
  "Supabase",
  "Tailwind CSS",
  "shadcn/ui",
]

const STATUS_LABEL: Record<LiveState, string> = {
  connecting: "Connecting to Realtime…",
  live: "Realtime connected",
  offline: "Realtime offline",
}

export function AboutCard({ liveState }: { liveState: LiveState }) {
  return (
    <section className="hidden rounded-[6px] border border-fb-border bg-white p-3 shadow-sm lg:block">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#4b5563]">
        About this wall
      </h2>
      <p className="mt-1.5 text-[12px] leading-relaxed text-[#4b5563]">
        A 2008-style Facebook wall rebuilt with modern tools. Every post is
        saved in Postgres and streamed to open tabs with Supabase Realtime.
      </p>

      <ul className="mt-2.5 flex flex-wrap gap-1">
        {STACK.map((item) => (
          <li
            key={item}
            className="rounded-[3px] border border-[#d8dfea] bg-[#f4f6fa] px-1.5 py-0.5 text-[10px] font-medium text-[#4b5563]"
          >
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-fb-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
        Tip: open this page in a second tab and post — it shows up in both
        without a reload.
      </p>

      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <GlobeIcon className="size-3.5 shrink-0" />
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            liveState === "live" && "text-[#2f6b3a]",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full bg-[#b45309]",
              liveState === "live" && "animate-live-pulse bg-[#3f9c53]",
              liveState === "offline" && "bg-[#b3261e]",
            )}
          />
          {STATUS_LABEL[liveState]}
        </span>
      </p>
    </section>
  )
}
