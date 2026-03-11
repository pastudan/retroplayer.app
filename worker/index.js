/**
 * Cloudflare Worker — Artist Discography SSE endpoint
 *
 * GET /artist/:id/discography?token=<spotify_access_token>
 *
 * Fans out Spotify API calls for an artist's singles, streams results
 * back to the client progressively as Server-Sent Events.
 *
 * Each SSE message carries: { singles: Track[] }
 * A final "done" event signals the stream is complete.
 */

const SPOTIFY_API = 'https://api.spotify.com/v1'

function sseMessage(data) {
  return `data: ${JSON.stringify(data)}\n\n`
}

async function spotifyFetch(path, token) {
  const res = await fetch(`${SPOTIFY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Spotify ${res.status} on ${path}`)
  return res.json()
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(request),
      })
    }

    // Route: /artist/:id/discography
    const match = url.pathname.match(/^\/artist\/([^/]+)\/discography$/)
    if (!match) {
      return new Response('Not found', { status: 404 })
    }

    const artistId = match[1]
    const token = url.searchParams.get('token')
    if (!token) {
      return new Response('Missing token', { status: 401 })
    }

    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()

    const write = (data) => writer.write(encoder.encode(sseMessage(data)))

    // Run the fan-out in the background so we can return the response immediately
    const stream = async () => {
      try {
        // Fetch all single-type releases for this artist
        const albumsData = await spotifyFetch(`/artists/${artistId}/albums?include_groups=single&limit=50`, token)
        const singleAlbums = albumsData.items ?? []

        // Fetch each single's tracks in parallel, emit as they resolve
        await Promise.all(
          singleAlbums.map(async (album) => {
            const tracksData = await spotifyFetch(`/albums/${album.id}/tracks`, token)
            const singles = tracksData.items.map((track) => ({ ...track, album }))
            await write({ singles })
          })
        )
      } catch (err) {
        console.error('Discography stream error:', err)
      } finally {
        await writer.write(encoder.encode('event: done\ndata: {}\n\n'))
        await writer.close()
      }
    }

    stream()

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...corsHeaders(request),
      },
    })
  },
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') ?? '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
