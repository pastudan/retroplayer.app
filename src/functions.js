export const NEXT_PUBLIC_SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
export const NEXT_PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN
export const ALBUM_ART_WIDTH = 150

const SPOTIFY_LOGIN_SCOPES = [
  //
  'streaming',
  'user-read-email ',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
]

export async function fetchSpotify(url, method, json) {
  const res = await fetch(`https://api.spotify.com/v1${url}`, {
    headers: { Authorization: `Bearer ${window.accessToken}`, 'Content-Type': 'application/json' },
    method: method || 'GET',
    body: json ? JSON.stringify(json) : undefined,
  })
  if (res.status > 200 && res.status < 300) return
  const data = await res.json()
  if (!res.ok) {
    console.error(data)
  }
  return data
}

export function getTokens() {
  if (typeof window === 'undefined') return
  const cookies = document.cookie.split('; ')
  let tokens = cookies.find((cookie) => cookie.includes('tokens'))?.split('=')[1]
  if (!tokens) return false
  tokens = JSON.parse(tokens)
  const timeout = new Date(tokens.expires) - new Date()
  window.refreshToken = tokens.refreshToken
  if (timeout > 0) {
    window.accessToken = tokens.accessToken
    setTimeout(async () => {
      const refreshRes = await fetch('/api/oauth-refresh')
      if (!refreshRes.ok) {
        console.error('Failed to refresh token')
        window.location.reload()
        return
      }
      getTokens()
    }, timeout - 5000) // refresh 5 seconds before it expires
  }
  return !!window.refreshToken
}

export const SPOTIFY_LOGIN_URL =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_LOGIN_SCOPES.join(' '),
    redirect_uri: NEXT_PUBLIC_ORIGIN + '/api/oauth-callback',
  }).toString()

export function msToTime(duration) {
  const seconds = parseInt((duration / 1000) % 60)
    .toString()
    .padStart(2, '0')
  const minutes = parseInt(duration / (1000 * 60))
  return `${minutes}:${seconds}`
}
