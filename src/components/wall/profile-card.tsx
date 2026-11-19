import { InitialsAvatar } from "@/components/wall/initials-avatar"

export function ProfileCard({
  postCount,
  hasMore,
  lastNote,
}: {
  postCount: number
  hasMore: boolean
  lastNote: string
}) {
  return (
    <section className="overflow-hidden rounded-[6px] border border-fb-border bg-white shadow-sm">
      <div className="border-b border-[#2f477a] bg-gradient-to-b from-[#4e69a2] to-[#3b5998] px-3 py-1.5">
        <h2 className="text-[12px] font-bold text-white">Enrique&apos;s Wall</h2>
      </div>

      <div className="flex gap-3 p-3 lg:block">
        <InitialsAvatar
          name="Enrique Ferolino"
          seed="enrique-ferolino"
          palette={0}
          className="size-16 rounded-[4px] text-[22px] lg:size-[180px] lg:text-[58px]"
        />
        <div className="min-w-0 lg:mt-3">
          <h1 className="text-[16px] font-bold leading-tight text-[#1c2a4a] lg:text-[19px]">
            Enrique Ferolino
          </h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Software developer · Cebu, Philippines
          </p>
          <p className="mt-1.5 hidden text-[12px] leading-relaxed text-[#4b5563] lg:block">
            Welcome to my wall. Leave a note and it appears for everyone,
            live — no refresh needed.
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-fb-border text-[12px]">
        <div className="px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Posts
          </dt>
          <dd className="text-[15px] font-bold text-[#1c2a4a]">
            {postCount}
            {hasMore ? "+" : ""}
          </dd>
        </div>
        <div className="border-l border-fb-border px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Last note
          </dt>
          <dd className="truncate text-[12px] font-semibold text-[#1c2a4a]">
            {lastNote}
          </dd>
        </div>
      </dl>
    </section>
  )
}
