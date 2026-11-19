const DEVICE_ID_KEY = "wall.device-id"
const DISPLAY_NAME_KEY = "wall.display-name"

let cachedName: string | null = null
const nameListeners = new Set<() => void>()

function read(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? ""
  } catch {
    return ""
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private browsing and blocked storage should not break the wall.
  }
}

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
  } catch {
    // Fall through to a non-cryptographic id.
  }

  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return ""

  const existing = read(DEVICE_ID_KEY)
  if (existing) return existing

  const created = randomId()
  write(DEVICE_ID_KEY, created)
  return created
}

export function subscribeDisplayName(listener: () => void): () => void {
  nameListeners.add(listener)
  return () => {
    nameListeners.delete(listener)
  }
}

export function getDisplayNameSnapshot(): string {
  if (cachedName === null) cachedName = read(DISPLAY_NAME_KEY)
  return cachedName
}

export function getDisplayNameServerSnapshot(): string {
  return ""
}

export function setDisplayName(name: string): void {
  cachedName = name
  write(DISPLAY_NAME_KEY, name)
  for (const listener of nameListeners) listener()
}
