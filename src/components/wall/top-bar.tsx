"use client"

import Link from "next/link"

import { CloseIcon, SearchIcon } from "@/components/wall/icons"
import { InitialsAvatar } from "@/components/wall/initials-avatar"
import type { LiveState } from "@/lib/wall"
import { cn } from "@/lib/utils"

function LiveBadge({
  liveState,
  people,
}: {
  liveState: LiveState
  people: number
}) {
  const live = liveState === "live"
  const label = live
    ? people > 0
      ? `${people} here now`
      : "Live"
    : liveState === "connecting"
      ? "Connecting…"
      : "Offline"

  return (
    <span
      role="status"
      className="inline-flex h-6 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 text-[11px] font-medium text-white/90 max-sm:border-transparent max-sm:bg-transparent max-sm:px-0"
      title={`Realtime status: ${label}`}
      aria-label={`Realtime status: ${label}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          live && "animate-live-pulse bg-[#8ef0a0]",
          liveState === "connecting" && "bg-[#ffd479]",
          liveState === "offline" && "bg-[#ff9b9b]",
        )}
      />
      <span aria-hidden="true" className="hidden sm:inline">
        {label}
      </span>
      {live && people > 0 ? (
        <span aria-hidden="true" className="text-[11px] tabular-nums sm:hidden">
          {people}
        </span>
      ) : null}
    </span>
  )
}

export function TopBar({
  search,
  onSearchChange,
  displayName,
  liveState,
  people,
}: {
  search: string
  onSearchChange: (value: string) => void
  displayName: string
  liveState: LiveState
  people: number
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#2f477a] bg-gradient-to-b from-[#4e69a2] to-[#3b5998] shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex h-[46px] w-full max-w-[980px] items-center gap-2 px-3 sm:gap-3">
        <Link
          href="/"
          title="My Wall home"
          className="shrink-0 rounded-[2px] text-[19px] font-bold leading-none tracking-[-0.04em] text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-[22px]"
        >
          facebook
        </Link>

        <div className="relative min-w-0 flex-1 sm:max-w-[260px]">
          <label htmlFor="wall-search" className="sr-only">
            Search the wall
          </label>
          <SearchIcon
            className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[#8a93a5]"
          />
          <input
            id="wall-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search the wall"
            autoComplete="off"
            className="h-7 w-full rounded-[3px] border border-[#29447e] bg-white pl-7 pr-7 text-[12px] text-[#333] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none placeholder:text-[#9299a8] focus:border-white/70 focus:ring-2 focus:ring-white/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-[2px] text-[#7a8494] outline-none hover:bg-[#eef1f7] hover:text-[#3b5998] focus-visible:ring-2 focus-visible:ring-[#3b5998]/40"
              aria-label="Clear search"
            >
              <CloseIcon className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <LiveBadge liveState={liveState} people={people} />

          <div className="flex items-center gap-1.5">
            <InitialsAvatar
              name={displayName || "Guest"}
              seed="wall-owner"
              className="size-6 rounded-[3px] text-[10px]"
            />
            <span className="hidden max-w-[120px] truncate text-[12px] font-semibold text-white/95 md:inline">
              {displayName || "Guest"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
