export const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
export const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_ORIGIN + '/callback'
export const ALBUM_ART_WIDTH = 150
export const DEFAULT_ALBUM_URL = '/album-placeholder.png'
export const DEFAULT_ARTIST_URL = '/artist-placeholder.png'

export const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

const SPOTIFY_LOGIN_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
]

// ---- PKCE helpers ----

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((x) => chars[x % chars.length])
    .join('')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function startPKCELogin() {
  const verifier = generateRandomString(128)
  const challenge = await generateCodeChallenge(verifier)
  localStorage.setItem('pkce_verifier', verifier)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_LOGIN_SCOPES.join(' '),
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })
  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString()
}

export async function handlePKCECallback(code) {
  const verifier = localStorage.getItem('pkce_verifier')
  if (!verifier) throw new Error('No PKCE verifier found')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) throw new Error('Token exchange failed')
  const data = await res.json()
  localStorage.removeItem('pkce_verifier')
  saveTokens(data)
}

function saveTokens(data) {
  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? localStorage.getItem('spotify_refresh_token'),
    expires: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
  localStorage.setItem('spotify_tokens', JSON.stringify(tokens))
  window.accessToken = tokens.accessToken
  window.refreshToken = tokens.refreshToken
}

export async function refreshTokens() {
  const stored = localStorage.getItem('spotify_tokens')
  if (!stored) return false
  const { refreshToken } = JSON.parse(stored)
  if (!refreshToken) return false

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
    }),
  })

  if (!res.ok) {
    console.error('Failed to refresh token')
    window.location.href = '/'
    return false
  }

  const data = await res.json()
  saveTokens(data)
  return true
}

export function getTokens() {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('spotify_tokens')
  if (!stored) return false
  const tokens = JSON.parse(stored)
  window.accessToken = tokens.accessToken
  window.refreshToken = tokens.refreshToken
  const timeout = new Date(tokens.expires) - new Date()
  const MIN_TIMEOUT = 5000
  if (timeout > MIN_TIMEOUT) {
    setTimeout(() => refreshTokens(), timeout - MIN_TIMEOUT)
    return true
  } else {
    // Token already expired — refresh before returning
    return refreshTokens().then(() => true).catch(() => false)
  }
}

// ---- Spotify API ----

export async function fetchSpotify(url, method, json) {
  const res = await fetch(`https://api.spotify.com/v1${url}`, {
    headers: { Authorization: `Bearer ${window.accessToken}`, 'Content-Type': 'application/json' },
    method: method || 'GET',
    body: json ? JSON.stringify(json) : undefined,
  })
  // 204 No Content (e.g. play/pause commands) — nothing to parse
  if (res.status === 204) return
  const data = await res.json()
  if (!res.ok) console.error(data)
  return data
}

export function msToTime(duration) {
  const seconds = parseInt((duration / 1000) % 60)
    .toString()
    .padStart(2, '0')
  const minutes = parseInt(duration / (1000 * 60))
  return `${minutes}:${seconds}`
}
