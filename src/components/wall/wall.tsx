"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { Button } from "@/components/ui/button"
import { AboutCard } from "@/components/wall/about-card"
import { Composer } from "@/components/wall/composer"
import {
  AlertIcon,
  ArrowDownIcon,
  CheckIcon,
} from "@/components/wall/icons"
import { InitialsAvatar } from "@/components/wall/initials-avatar"
import { PostCard } from "@/components/wall/post-card"
import { ProfileCard } from "@/components/wall/profile-card"
import { TopBar } from "@/components/wall/top-bar"
import {
  getDeviceId,
  getDisplayNameServerSnapshot,
  getDisplayNameSnapshot,
  setDisplayName,
  subscribeDisplayName,
} from "@/lib/identity"
import { isSupabaseConfigured } from "@/lib/supabase"
import { formatRelativeTime } from "@/lib/time"
import {
  FEED_PAGE_SIZE,
  type LiveState,
  type Post,
  createPost,
  fetchPosts,
  fetchProfiles,
  saveDisplayName,
  sortNewestFirst,
  subscribeToNewPosts,
  trackPresence,
} from "@/lib/wall"

type Status = "loading" | "ready" | "error" | "unconfigured"

function mergePosts(a: Post[], b: Post[]): Post[] {
  const merged = new Map<string, Post>()
  for (const post of [...a, ...b]) merged.set(post.id, post)
  return sortNewestFirst([...merged.values()])
}

function FeedSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-2">
      {[0, 1].map((index) => (
        <div
          key={index}
          className="rounded-[6px] border border-fb-border bg-white p-3 shadow-sm"
        >
          <div className="flex animate-pulse gap-2.5">
            <div className="size-12 rounded-[4px] bg-[#e6eaf1]" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-2.5 w-28 rounded bg-[#e6eaf1]" />
              <div className="h-2.5 w-full rounded bg-[#eef1f5]" />
              <div className="h-2.5 w-4/5 rounded bg-[#eef1f5]" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only" role="status">
        Loading the wall…
      </span>
    </div>
  )
}

function SetupNotice() {
  return (
    <section className="rounded-[6px] border border-[#e8c98a] bg-[#fffaf0] p-4 shadow-sm">
      <h2 className="text-[14px] font-bold text-[#7a4b00]">
        Connect the wall to Supabase
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-[#6b4a12]">
        This panel appears because the Supabase environment variables are
        missing. Three quick steps:
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-relaxed text-[#6b4a12]">
        <li>
          Create a project at{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#3b5998] underline"
          >
            supabase.com
          </a>
          .
        </li>
        <li>
          Run <code className="rounded bg-white/70 px-1">supabase/schema.sql</code>{" "}
          in the SQL editor.
        </li>
        <li>
          Copy <code className="rounded bg-white/70 px-1">.env.example</code> to{" "}
          <code className="rounded bg-white/70 px-1">.env.local</code>, add your
          project URL and anon key, then restart the dev server.
        </li>
      </ol>
    </section>
  )
}

export function Wall() {
  const configured = isSupabaseConfigured()

  const [status, setStatus] = useState<Status>(() =>
    configured ? "loading" : "unconfigured",
  )
  const [error, setError] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [authors, setAuthors] = useState<Record<string, string>>({})
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set())
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [deviceId] = useState(() =>
    typeof window === "undefined" ? "" : getDeviceId(),
  )
  const displayName = useSyncExternalStore(
    subscribeDisplayName,
    getDisplayNameSnapshot,
    getDisplayNameServerSnapshot,
  )
  const [liveState, setLiveState] = useState<LiveState>(() =>
    configured ? "connecting" : "offline",
  )
  const [people, setPeople] = useState(0)
  const [now, setNow] = useState(0)
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  )

  const knownAuthorIds = useRef<Set<string>>(new Set())

  const hydrateAuthors = useCallback(async (ids: Array<string | null>) => {
    const unique = ids.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    )
    const missing = unique.filter((id) => !knownAuthorIds.current.has(id))
    if (missing.length === 0) return

    for (const id of missing) knownAuthorIds.current.add(id)

    const profiles = await fetchProfiles(missing)
    if (profiles.size === 0) return

    setAuthors((previous) => ({
      ...previous,
      ...Object.fromEntries(profiles),
    }))
  }, [])

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return

    try {
      const latest = await fetchPosts({ limit: FEED_PAGE_SIZE })
      setPosts((previous) => mergePosts(latest, previous))
      setHasMore(latest.length === FEED_PAGE_SIZE)
      setStatus("ready")
      void hydrateAuthors(latest.map((post) => post.user_id))
    } catch (loadError) {
      setStatus("error")
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the wall. Please try again.",
      )
    }
  }, [hydrateAuthors])

  useEffect(() => {
    if (!configured) return
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [configured, load])

  useEffect(() => {
    if (!configured) return

    return subscribeToNewPosts({
      onPost: (post) => {
        setPosts((previous) =>
          previous.some((item) => item.id === post.id)
            ? previous
            : sortNewestFirst([post, ...previous]),
        )
        setFreshIds((previous) => {
          const next = new Set(previous)
          next.add(post.id)
          return next
        })
        void hydrateAuthors([post.user_id])
      },
      onStatus: setLiveState,
    })
  }, [configured, hydrateAuthors])

  useEffect(() => {
    if (!deviceId || !configured) return
    return trackPresence(deviceId, setPeople)
  }, [configured, deviceId])

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const firstTick = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 30_000)
    return () => {
      window.clearTimeout(firstTick)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const handleDisplayNameChange = useCallback((value: string) => {
    setDisplayName(value)
  }, [])

  const handleShare = useCallback(
    async (body: string) => {
      if (!deviceId) {
        throw new Error("Still getting things ready. Try again in a second.")
      }

      const trimmed = body.trim()
      const temporaryId = `temp-${Date.now()}`
      const optimistic: Post = {
        id: temporaryId,
        user_id: deviceId,
        body: trimmed,
        created_at: new Date().toISOString(),
      }

      setPosts((previous) => sortNewestFirst([optimistic, ...previous]))
      setFreshIds((previous) => {
        const next = new Set(previous)
        next.add(temporaryId)
        return next
      })
      if (displayName.trim()) {
        setAuthors((previous) => ({
          ...previous,
          [deviceId]: displayName.trim(),
        }))
      }

      try {
        const created = await createPost({ body: trimmed, userId: deviceId })
        setPosts((previous) =>
          sortNewestFirst([
            created,
            ...previous.filter(
              (post) => post.id !== temporaryId && post.id !== created.id,
            ),
          ]),
        )
        setFreshIds((previous) => {
          const next = new Set(previous)
          next.delete(temporaryId)
          next.add(created.id)
          return next
        })

        if (displayName.trim()) {
          knownAuthorIds.current.add(deviceId)
          void saveDisplayName(deviceId, displayName.trim())
        }

        setToast({ id: Date.now(), message: "Your note is on the wall." })
      } catch (shareError) {
        setPosts((previous) =>
          previous.filter((post) => post.id !== temporaryId),
        )
        setFreshIds((previous) => {
          const next = new Set(previous)
          next.delete(temporaryId)
          return next
        })
        throw shareError
      }
    },
    [deviceId, displayName],
  )

  const handleLoadMore = useCallback(async () => {
    const oldest = posts[posts.length - 1]
    if (!oldest || loadingMore) return

    setLoadingMore(true)

    try {
      const older = await fetchPosts({
        before: oldest.created_at,
        limit: FEED_PAGE_SIZE,
      })
      setPosts((previous) => mergePosts(previous, older))
      setHasMore(older.length === FEED_PAGE_SIZE)
      void hydrateAuthors(older.map((post) => post.user_id))
    } catch {
      setToast({
        id: Date.now(),
        message: "Couldn't load older notes. Please try again.",
      })
    } finally {
      setLoadingMore(false)
    }
  }, [hydrateAuthors, loadingMore, posts])

  const query = search.trim().toLowerCase()

  const visiblePosts = useMemo(() => {
    if (!query) return posts

    return posts.filter((post) => {
      const author = authors[post.user_id ?? ""] ?? "Guest"
      return (
        post.body.toLowerCase().includes(query) ||
        author.toLowerCase().includes(query)
      )
    })
  }, [authors, posts, query])

  const postCountLabel = `${posts.length}${hasMore ? "+" : ""} ${
    posts.length === 1 && !hasMore ? "post" : "posts"
  }`
  const lastNote = posts[0]
    ? formatRelativeTime(posts[0].created_at, now)
    : "—"

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        search={search}
        onSearchChange={setSearch}
        displayName={displayName || "Guest"}
        liveState={liveState}
        people={people}
      />

      <main
        id="main"
        className="mx-auto w-full max-w-[980px] flex-1 px-3 py-3 sm:px-4 sm:py-4"
      >
        <div className="grid items-start gap-3 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-4">
          <aside className="space-y-3">
            <ProfileCard
              postCount={posts.length}
              hasMore={hasMore}
              lastNote={lastNote}
            />
            <AboutCard liveState={liveState} />
          </aside>

          <div className="min-w-0 space-y-3">
            {status === "unconfigured" ? (
              <SetupNotice />
            ) : (
              <Composer
                displayName={displayName}
                onDisplayNameChange={handleDisplayNameChange}
                onShare={handleShare}
              />
            )}

            <section aria-labelledby="wall-heading" className="space-y-2">
              <div className="flex items-baseline justify-between gap-2 px-1">
                <h2
                  id="wall-heading"
                  className="text-[15px] font-bold text-[#1c2a4a]"
                >
                  {query ? "Search results" : "The Wall"}{" "}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {query
                      ? `${visiblePosts.length} found`
                      : postCountLabel}
                  </span>
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  Newest first
                </span>
              </div>

              {status === "loading" ? <FeedSkeleton /> : null}

              {status === "error" ? (
                <div className="rounded-[6px] border border-[#e8b9b4] bg-[#fdf1f0] p-4 text-center">
                  <AlertIcon className="mx-auto size-5 text-[#b3261e]" />
                  <p className="mt-1.5 text-[13px] font-semibold text-[#8a1c14]">
                    The wall didn&apos;t load
                  </p>
                  <p className="mx-auto mt-1 max-w-[46ch] text-[12px] leading-relaxed text-[#8a1c14]">
                    {error}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setStatus("loading")
                      setError("")
                      void load()
                    }}
                  >
                    Try again
                  </Button>
                </div>
              ) : null}

              {status === "ready" && visiblePosts.length === 0 ? (
                <div className="rounded-[6px] border border-dashed border-[#c9d3e2] bg-white/70 px-4 py-9 text-center">
                  {query ? (
                    <>
                      <p className="text-[13px] font-semibold text-[#1c2a4a]">
                        No notes match &ldquo;{search.trim()}&rdquo;
                      </p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        Try a different word, or clear the search.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setSearch("")}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <InitialsAvatar
                        name="E"
                        seed="enrique-ferolino"
                        palette={0}
                        className="mx-auto size-10 text-[15px] opacity-80"
                      />
                      <p className="mt-2 text-[13px] font-semibold text-[#1c2a4a]">
                        No notes yet
                      </p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        Be the first to write on the wall.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          document.getElementById("post-body")?.focus()
                        }
                      >
                        Write the first note
                      </Button>
                    </>
                  )}
                </div>
              ) : null}

              {status === "ready" && visiblePosts.length > 0 ? (
                <ol
                  aria-label="Wall posts"
                  className="space-y-2"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  {visiblePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      author={authors[post.user_id ?? ""] ?? "Guest"}
                      isOwn={post.user_id === deviceId}
                      isNew={freshIds.has(post.id)}
                      now={now}
                    />
                  ))}
                </ol>
              ) : null}

              {status === "ready" && !query && hasMore ? (
                <div className="pt-1 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                  >
                    <ArrowDownIcon className="size-3.5" />
                    {loadingMore ? "Loading…" : "Load older notes"}
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-[980px] px-3 pb-5 pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
        A 2008-style wall · Built with React 19, Next.js 16 and Supabase.
      </footer>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
          <div
            role="status"
            className="animate-toast-in flex items-center gap-2 rounded-full bg-[#1c2a4a] px-4 py-2 text-[12px] font-medium text-white shadow-lg"
          >
            <CheckIcon className="size-4 text-[#8ef0a0]" />
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  )
}
