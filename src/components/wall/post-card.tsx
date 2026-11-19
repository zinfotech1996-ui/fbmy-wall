import { Fragment } from "react"

import { InitialsAvatar } from "@/components/wall/initials-avatar"
import { formatFullDateTime, formatRelativeTime } from "@/lib/time"
import type { Post } from "@/lib/wall"
import { cn } from "@/lib/utils"

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g
const TRAILING_PUNCTUATION = /[.,!?;:]+$/

function renderBody(body: string) {
  const parts = body.split(URL_PATTERN)

  return parts.map((part, index) => {
    if (index % 2 === 0) return part

    const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? ""
    const href = trailing ? part.slice(0, -trailing.length) : part

    return (
      <Fragment key={index}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="break-words text-[#3b5998] hover:underline"
        >
          {href}
        </a>
        {trailing}
      </Fragment>
    )
  })
}

export function PostCard({
  post,
  author,
  isOwn,
  isNew,
  now,
}: {
  post: Post
  author: string
  isOwn: boolean
  isNew: boolean
  now: number
}) {
  return (
    <li>
      <article
        className={cn(
          "rounded-[6px] border border-fb-border bg-white p-3 shadow-sm transition-colors",
          isNew && "animate-post-in",
        )}
      >
        <div className="flex gap-2.5">
          <InitialsAvatar
            name={author}
            seed={post.user_id ?? author}
            className="size-12 rounded-[4px] text-[17px]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="text-[13px] font-bold text-[#3b5998]">
                {author}
              </span>
              {isOwn ? (
                <span className="rounded-[2px] bg-[#eef1f7] px-1 text-[9px] font-bold uppercase tracking-wide text-[#4b5563]">
                  you
                </span>
              ) : null}
              <time
                dateTime={post.created_at}
                title={formatFullDateTime(post.created_at)}
                className="text-[11px] text-muted-foreground"
              >
                {formatRelativeTime(post.created_at, now)}
              </time>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-[1.5] text-[#333]">
              {renderBody(post.body)}
            </p>
          </div>
        </div>
      </article>
    </li>
  )
}
