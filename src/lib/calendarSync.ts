const STORAGE_KEY = 'atlasos_google_calendar'

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
  expiry_date?: number
}

interface GoogleEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  location?: string
  htmlLink?: string
  recurringEventId?: string
}

export interface SyncedCalendarEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
  allDay: boolean
  source: 'google' | 'local'
  location?: string
  url?: string
  color?: string
}

// ── Token Management ──

function getStoredToken(): GoogleTokenResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeToken(token: GoogleTokenResponse) {
  token.expiry_date = Date.now() + token.expires_in * 1000
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token))
}

function clearToken() {
  localStorage.removeItem(STORAGE_KEY)
}

function isTokenExpired(token: GoogleTokenResponse): boolean {
  return !token.expiry_date || Date.now() >= token.expiry_date
}

// ── OAuth Flow ──

const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/settings`
  : ''

export function getGoogleAuthUrl(clientId: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    include_granted_scopes: 'true',
    state: 'google_calendar_sync',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function handleRedirectCallback(): boolean {
  const hash = window.location.hash.substring(1)
  if (!hash) return false
  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const expiresIn = params.get('expires_in')
  const scope = params.get('scope')
  const state = params.get('state')
  if (!accessToken || state !== 'google_calendar_sync') return false
  storeToken({
    access_token: accessToken,
    expires_in: parseInt(expiresIn || '3600'),
    scope: scope || '',
    token_type: 'Bearer',
  })
  window.location.hash = ''
  return true
}

export function isGoogleConnected(): boolean {
  const token = getStoredToken()
  return token !== null && !isTokenExpired(token)
}

export function disconnectGoogle() {
  clearToken()
}

// ── API Calls ──

async function fetchWithToken(url: string): Promise<any> {
  const token = getStoredToken()
  if (!token || isTokenExpired(token)) throw new Error('Google Calendar not connected or token expired')
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!res.ok) throw new Error(`Google API error: ${res.status}`)
  return res.json()
}

export async function fetchGoogleEvents(timeMin?: string, timeMax?: string): Promise<SyncedCalendarEvent[]> {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  if (timeMin) params.set('timeMin', timeMin)
  if (timeMax) params.set('timeMax', timeMax)

  const data = await fetchWithToken(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`)
  const items: GoogleEvent[] = data.items || []

  return items.map((ev) => {
    const startDateTime = ev.start.dateTime || ev.start.date || ''
    const endDateTime = ev.end.dateTime || ev.end.date || ''
    const allDay = !ev.start.dateTime

    return {
      id: `google_${ev.id}`,
      title: ev.summary || '(No title)',
      description: ev.description || '',
      start: startDateTime,
      end: endDateTime,
      allDay,
      source: 'google' as const,
      location: ev.location || undefined,
      url: ev.htmlLink || undefined,
      color: '#4285F4',
    }
  })
}

export async function syncGoogleEvents(): Promise<SyncedCalendarEvent[]> {
  try {
    const events = await fetchGoogleEvents()
    return events
  } catch (err) {
    console.warn('Failed to sync Google Calendar:', err)
    return []
  }
}
