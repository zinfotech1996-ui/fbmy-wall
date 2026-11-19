"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertIcon, PencilIcon, SpinnerIcon } from "@/components/wall/icons"
import { InitialsAvatar } from "@/components/wall/initials-avatar"
import { MAX_NAME_LENGTH, MAX_POST_LENGTH } from "@/lib/wall"
import { cn } from "@/lib/utils"

export function Composer({
  displayName,
  onDisplayNameChange,
  onShare,
}: {
  displayName: string
  onDisplayNameChange: (value: string) => void
  onShare: (body: string) => Promise<void>
}) {
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const trimmed = body.trim()
  const remaining = MAX_POST_LENGTH - body.length
  const canShare = trimmed.length > 0 && !submitting

  async function submit() {
    if (!canShare) return

    setSubmitting(true)
    setError("")

    try {
      await onShare(body)
      setBody("")
      textareaRef.current?.focus()
    } catch (shareError) {
      setError(
        shareError instanceof Error
          ? shareError.message
          : "Could not share your note. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="composer-heading"
      className="overflow-hidden rounded-[6px] border border-fb-border bg-white shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-fb-border bg-[#f7f9fc] px-3 py-2">
        <InitialsAvatar
          name={displayName || "Guest"}
          seed="composer"
          className="size-7 rounded-[3px] text-[11px]"
        />
        <h2 id="composer-heading" className="text-[12px] text-[#4b5563]">
          Write on{" "}
          <span className="font-bold text-[#1c2a4a]">Enrique&apos;s wall</span>
        </h2>
        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
          {MAX_POST_LENGTH} characters max
        </span>
      </div>

      <form
        className="p-3"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <label htmlFor="post-body" className="sr-only">
          What&apos;s on your mind?
        </label>
        <Textarea
          id="post-body"
          ref={textareaRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault()
              void submit()
            }
          }}
          maxLength={MAX_POST_LENGTH}
          rows={3}
          placeholder="What's on your mind?"
          aria-describedby="composer-hint post-counter"
          className="min-h-[78px] resize-none rounded-[3px] border-[#bdc7d8] bg-white px-2.5 py-2 text-[14px] leading-relaxed text-[#333] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#8a93a5] focus-visible:border-[#6b8ad4] focus-visible:ring-2 focus-visible:ring-[#6b8ad4]/25"
        />

        {error ? (
          <p
            role="alert"
            className="mt-2 flex items-start gap-1.5 rounded-[3px] border border-[#e8b9b4] bg-[#fdf1f0] px-2 py-1.5 text-[12px] text-[#8a1c14]"
          >
            <AlertIcon className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex h-7 items-center gap-1.5 rounded-[3px] border border-[#bdc7d8] bg-[#fbfcfe] px-2 focus-within:border-[#6b8ad4] focus-within:ring-2 focus-within:ring-[#6b8ad4]/20">
            <PencilIcon className="size-3 shrink-0 text-[#8a93a5]" />
            <label htmlFor="display-name" className="sr-only">
              Your name
            </label>
            <input
              id="display-name"
              value={displayName}
              onChange={(event) => onDisplayNameChange(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Your name"
              autoComplete="nickname"
              aria-describedby="name-hint"
              className="w-[118px] bg-transparent text-[12px] text-[#333] outline-none placeholder:text-[#9aa3b2] sm:w-[150px]"
            />
          </div>
          <span id="name-hint" className="sr-only">
            Optional. This name is shown next to your post and kept on this
            device only.
          </span>

          <span
            id="composer-hint"
            className="hidden text-[11px] text-muted-foreground md:inline"
          >
            Tip: press Ctrl + Enter to share
          </span>

          <div className="ml-auto flex items-center gap-3">
            <span
              id="post-counter"
              className={cn(
                "min-w-7 text-right text-[11px] tabular-nums text-muted-foreground",
                remaining <= 40 && "text-[#a15c00]",
                remaining <= 0 && "font-bold text-[#b3261e]",
              )}
              title={`${remaining} characters left`}
            >
              {remaining}
            </span>
            <Button
              type="submit"
              variant="facebook"
              size="share"
              disabled={!canShare}
              aria-disabled={!canShare}
            >
              {submitting ? (
                <>
                  <SpinnerIcon className="size-3.5" />
                  Sharing…
                </>
              ) : (
                "Share"
              )}
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}
