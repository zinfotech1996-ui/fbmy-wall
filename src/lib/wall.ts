import type {
  RealtimePostgresInsertPayload,
  SupabaseClient,
} from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"

export const MAX_POST_LENGTH = 280
export const MAX_NAME_LENGTH = 40
export const FEED_PAGE_SIZE = 30

export type Post = {
  id: string
  user_id: string | null
  body: string
  created_at: string
}

export type LiveState = "connecting" | "live" | "offline"

export class WallError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = "WallError"
    this.code = code
  }
}

function requireClient(): SupabaseClient {
  const client = getSupabaseClient()
  if (!client) {
    throw new WallError(
      "Supabase is not configured yet. Add your project URL and anon key to .env.local, then restart the app.",
    )
  }
  return client
}

function toWallError(error: {
  message?: string
  code?: string
  details?: string | null
}): WallError {
  const code = error.code
  const message = error.message ?? ""

  if (code === "42P01") {
    return new WallError(
      "The posts table does not exist yet. Run supabase/schema.sql in the Supabase SQL editor.",
      code,
    )
  }

  if (code === "42501" || message.includes("row-level security")) {
    return new WallError(
      "The database refused that request. Check the row level security policies from supabase/schema.sql.",
      code,
    )
  }

  if (code === "23514" || code === "23502") {
    return new WallError(
      "That post could not be saved. It must be between 1 and 280 characters.",
      code,
    )
  }

  if (
    message.toLowerCase().includes("failed to fetch") ||
    message.toLowerCase().includes("network")
  ) {
    return new WallError(
      "Can't reach Supabase. Check your internet connection and the project URL.",
      code,
    )
  }

  return new WallError(message || "Something went wrong. Please try again.", code)
}

export function sortNewestFirst(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function fetchPosts({
  before,
  limit = FEED_PAGE_SIZE,
}: {
  before?: string
  limit?: number
} = {}): Promise<Post[]> {
  const client = requireClient()

  let query = client
    .from("posts")
    .select("id, user_id, body, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (before) query = query.lt("created_at", before)

  const { data, error } = await query
  if (error) throw toWallError(error)

  return (data ?? []) as Post[]
}

export async function fetchProfiles(
  ids: string[],
): Promise<Map<string, string>> {
  const client = getSupabaseClient()
  const result = new Map<string, string>()
  const unique = [...new Set(ids.filter(Boolean))]
  if (!client || unique.length === 0) return result

  const { data, error } = await client
    .from("profiles")
    .select("id, display_name")
    .in("id", unique)

  if (error) {
    // Author names are a nice-to-have. If the optional profiles table is
    // missing, the wall still works and falls back to "Guest".
    if (error.code !== "42P01") {
      console.warn("Could not load wall profiles:", error.message)
    }
    return result
  }

  for (const profile of data ?? []) {
    if (profile.id && profile.display_name) {
      result.set(profile.id, profile.display_name)
    }
  }

  return result
}

export async function createPost({
  body,
  userId,
}: {
  body: string
  userId: string
}): Promise<Post> {
  const client = requireClient()
  const trimmed = body.trim()

  if (!trimmed) throw new WallError("Write something before sharing.")
  if (trimmed.length > MAX_POST_LENGTH) {
    throw new WallError(
      `Keep it under ${MAX_POST_LENGTH} characters (${trimmed.length} used).`,
    )
  }

  const { data, error } = await client
    .from("posts")
    .insert({ body: trimmed, user_id: userId })
    .select("id, user_id, body, created_at")
    .single()

  if (error) throw toWallError(error)
  return data as Post
}

export async function saveDisplayName(
  userId: string,
  displayName: string,
): Promise<void> {
  const client = getSupabaseClient()
  const name = displayName.trim()
  if (!client || !userId || !name) return

  const { error } = await client
    .from("profiles")
    .upsert({ id: userId, display_name: name }, { onConflict: "id" })

  if (error && error.code !== "42P01") {
    console.warn("Could not save display name:", error.message)
  }
}

export function subscribeToNewPosts(handlers: {
  onPost: (post: Post) => void
  onStatus: (state: LiveState) => void
}): () => void {
  const client = getSupabaseClient()
  if (!client) return () => {}

  const channel = client
    .channel(`wall-feed-${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "posts" },
      (payload: RealtimePostgresInsertPayload<Post>) => {
        const post = payload.new
        if (post?.id) handlers.onPost(post)
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        handlers.onStatus("live")
        return
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        handlers.onStatus("offline")
        return
      }

      if (status === "CLOSED") handlers.onStatus("offline")
    })

  return () => {
    void client.removeChannel(channel)
  }
}

export function trackPresence(
  clientId: string,
  onChange: (count: number) => void,
): () => void {
  const client = getSupabaseClient()
  if (!client || !clientId) return () => {}

  const channel = client.channel("wall-presence", {
    config: { presence: { key: clientId } },
  })

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState()
    const count = Object.values(state).reduce(
      (total, entries) => total + entries.length,
      0,
    )
    onChange(count)
  })

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      void channel.track({ online_at: new Date().toISOString() })
    }
  })

  return () => {
    onChange(0)
    void client.removeChannel(channel)
  }
}
