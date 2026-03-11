import { useState, useEffect } from 'react'
import { fetchSpotify, msToTime, ALBUM_ART_WIDTH, DEFAULT_ARTIST_URL } from '@/functions.js'
import { Heart, Volume2, Clipboard, Radio } from 'lucide-react'
import PopularityChart from '@/components/PopularityChart.jsx'
import ArtistLinks from '@/components/ArtistLinks.jsx'
import Album from '@/components/Album.jsx'

const DISCOGRAPHY_URL = import.meta.env.VITE_DISCOGRAPHY_URL

export default function Artist({ context, setContext, currentTrack }) {
  const [artist, setArtist] = useState({})
  const [topTracks, setTopTracks] = useState([])
  const [singles, setSingles] = useState([])
  const [albums, setAlbums] = useState([])
  const [relatedArtists, setRelatedArtists] = useState([])
  const [copied, setCopied] = useState(false)
  const [showArtwork, setShowArtwork] = useState(false)

  // Fetch artist metadata, top tracks, full albums, and related artists
  useEffect(() => {
    setArtist({})
    setTopTracks([])
    setAlbums([])
    setRelatedArtists([])

    fetchSpotify(`/artists/${context.id}`).then((data) => setArtist(data))
    fetchSpotify(`/artists/${context.id}/top-tracks`).then((data) => setTopTracks(data.tracks))
    fetchSpotify(`/artists/${context.id}/albums`).then((data) => {
      setAlbums(data.items)
    })
    fetchSpotify(`/artists/${context.id}/related-artists`).then((data) => setRelatedArtists(data.artists))
  }, [context])

  // Stream singles via SSE — resets and reconnects whenever artist changes
  useEffect(() => {
    setSingles([])
    if (!DISCOGRAPHY_URL) return

    const url = new URL(`${DISCOGRAPHY_URL}/artist/${context.id}/discography`)
    url.searchParams.set('token', window.accessToken)
    const eventSource = new EventSource(url.toString())

    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      if (data.singles) setSingles((prev) => [...prev, ...data.singles])
    })
    eventSource.addEventListener('done', () => eventSource.close())
    eventSource.addEventListener('error', () => eventSource.close())

    return () => eventSource.close()
  }, [context])

  return (
    <div className="after-end-line">
      <div className="flex p-4">
        <div
          style={{
            width: ALBUM_ART_WIDTH,
            height: ALBUM_ART_WIDTH,
            backgroundImage: `url(${artist.images?.[0]?.url || DEFAULT_ARTIST_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
          }}
        />
        <div className="w-full ml-4">
          <h1 className="text-base font-semibold">{context.name}</h1>
          <div className="text-sm text-stone-400 bg-stone-900 py-1.5 px-2.5 mt-1 w-full rounded flex justify-between">
            <span>{artist.genres?.join(', ')}</span>
            <span>
              <a
                className="cursor-pointer hover:underline ml-3"
                onClick={() => {
                  navigator.clipboard.writeText(artist.href)
                }}
              >
                <Radio />
                Start Artist Radio
              </a>
              <a
                className="cursor-pointer hover:underline ml-3"
                onClick={() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                  const link = window.location.origin + '/artist/' + artist.id
                  navigator.clipboard.writeText(link)
                }}
              >
                <Clipboard />
                {copied ? 'Copied!' : 'Link'}
              </a>
            </span>
          </div>
        </div>
        <div className="ml-4" style={{ width: '30%' }}>
          <h2 className="py-1 text-base font-semibold">Related Artists</h2>
          <div className="overflow-x-scroll whitespace-nowrap">
            {relatedArtists.map((artist) => (
              <div
                key={artist.id}
                className="inline-block w-14 h-14 mr-1 cursor-pointer"
                onClick={() => setContext({ type: 'artist', ...artist })}
                title={artist.name}
                style={{
                  background: `url(${artist.images?.[0]?.url || DEFAULT_ARTIST_URL}) center center / cover no-repeat`,
                }}
              />
            ))}
          </div>
          <div className="clamp-2">{ArtistLinks({ artists: relatedArtists, setContext })}</div>
        </div>
      </div>

      <h2 className="px-4 py-1 mt-5 uppercase font-semibold bg-separator">Top Hits</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-500 underline text-table-header">
            <th className="py-1"></th>
            <th className="py-1">Title</th>
            <th className="py-1">Artists</th>
            <th className="py-1">Album</th>
            <th className="py-1">Popularity</th>
            <th className="py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {topTracks.map((track, index) => {
            const isPlaying = currentTrack === track.uri
            const uris = topTracks.map((track) => track.uri)
            return (
              <tr
                key={track.id}
                className={`hover:bg-main-hover cursor-pointer ${isPlaying ? 'text-green-500' : ''}`}
                onClick={() => {
                  fetchSpotify(`/me/player/play`, 'PUT', { uris: uris.slice(index) })
                }}
              >
                <td className="px-2 w-14 text-right">
                  {isPlaying && <Volume2 fill="currentColor" strokeWidth={1} />}
                  <Heart strokeWidth={2} />
                </td>
                <td>{track.name}</td>
                <td>{ArtistLinks({ artists: track.artists, setContext })}</td>
                <td>{track?.album?.name}</td>
                <td>{PopularityChart({ popularity: track.popularity })}</td>
                <td>{msToTime(track.duration_ms)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h2 className="px-4 py-1 mt-5 bg-separator">
        <span className="uppercase font-semibold">Singles</span>
        <a className="ml-2 text-stone-400 text-xs ml-4 group-hover:block hover:underline cursor-pointer" onClick={() => setShowArtwork(!showArtwork)}>
          show artwork
        </a>
      </h2>
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-500 underline text-table-header">
            <th className="py-1"></th>
            <th className="py-1">Title</th>
            <th className="py-1">Artists</th>
            <th className="py-1">Year</th>
            <th className="py-1">Popularity</th>
            <th className="py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {singles.map((track) => {
            const isPlaying = currentTrack === track.uri
            return (
              <tr
                key={track.id}
                className={`hover:bg-main-hover cursor-pointer ${isPlaying ? 'text-green-500' : ''}`}
                onClick={() => {
                  fetchSpotify(`/me/player/play`, 'PUT', { uris: [track.uri] })
                }}
              >
                <td className="px-2 w-14 text-right">
                  {isPlaying && <Volume2 fill="currentColor" strokeWidth={1} />}
                  <Heart strokeWidth={2} />
                </td>
                <td>{track.name}</td>
                <td>{ArtistLinks({ artists: track.artists, setContext })}</td>
                <td>{new Date(track?.album?.release_date).getFullYear()}</td>
                <td>{PopularityChart({ popularity: track.popularity })}</td>
                <td>{msToTime(track.duration_ms)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h2 className="px-4 py-1 mt-5 uppercase font-semibold bg-separator">Albums</h2>
      {albums
        .filter((album) => album.album_type !== 'single')
        .map((album) => (
          <Album key={album.id} {...{ album, setContext, currentTrack }} />
        ))}
    </div>
  )
}
