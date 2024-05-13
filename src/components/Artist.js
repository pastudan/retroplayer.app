import { useState, useEffect } from 'react'
import { fetchSpotify, msToTime, ALBUM_ART_WIDTH } from '@/functions.js'
import { Heart, Volume2, Clipboard, Radio } from 'lucide-react'
import PopularityChart from '@/components/PopularityChart.js'
import ArtistLinks from '@/components/ArtistLinks.js'
import Album from '@/components/Album.js'

const DEFAULT_ALBUM_URL = '/album-placeholder.png'
const DEFAULT_ARTIST_URL = '/artist-placeholder.png'

export default function Artist({ context, setContext, currentTrack }) {
  const [artist, setArtist] = useState({})
  const [topTracks, setTopTracks] = useState([])
  const [singles, setSingles] = useState([])
  const [albums, setAlbums] = useState([])
  const [relatedArtists, setRelatedArtists] = useState([])
  const [copied, setCopied] = useState(false)
  const [showArtwork, setShowArtwork] = useState(false)

  useEffect(() => {
    // setArtist({})
    setSingles([])
    // setAlbums([])
    // setTopTracks([])

    fetchSpotify(`/artists/${context.id}`).then((data) => {
      console.log('artist', data)
      setArtist(data)
    })
    fetchSpotify(`/artists/${context.id}/top-tracks`).then((data) => setTopTracks(data.tracks))
    fetchSpotify(`/artists/${context.id}/albums`).then((data) => {
      const singleAlbums = data.items.filter((album) => album.album_type === 'single')
      const fullAlbums = data.items.filter((album) => album.album_type === 'album')
      console.log('Single Albums', singleAlbums)
      console.log('Full Albums', fullAlbums)

      singleAlbums.forEach(async (album) => {
        const data = await fetchSpotify(`/albums/${album.id}/tracks`)
        setSingles((singles) => [...singles, ...data.items])
      })
      setAlbums(data.items)
    })
    fetchSpotify(`/artists/${context.id}/related-artists`).then((data) => setRelatedArtists(data.artists))
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
                  navigator.clipboard.writeText(artist.href)
                }}
              >
                <Clipboard />
                {copied ? 'Copied!' : 'Share'}
              </a>
            </span>
          </div>
          {/* <span className="text-xs text-stone-400 mt-1">{artist.followers?.total} followers</span> */}
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
                  console.log(`Playing [track from artist top hits] "${track.name}" — ${track.uri}`, track)
                }}
              >
                <td className="px-2 w-14 text-right">
                  {isPlaying && <Volume2 fill="currentColor" strokeWidth={1} />}
                  <Heart
                    // fill="currentColor"
                    strokeWidth={2}
                  />
                </td>
                <td>{track.name}</td>
                <td>{ArtistLinks({ artists: track.artists, setContext })}</td>
                <td>{track?.album?.name}</td>
                <td>{PopularityChart({ popularity: track.popularity })}</td>
                <td>{msToTime(track.duration_ms)}</td>
                {/* <pre>{JSON.stringify(track, null, 2)}</pre> */}
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
            <th className="py-1">Album</th>
            <th className="py-1">Year</th>
            <th className="py-1">Popularity</th>
            <th className="py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {singles.map((track, index) => {
            const isPlaying = currentTrack === track.uri
            const uris = topTracks.map((track) => track.uri)
            return (
              <tr
                key={track.id}
                className={`hover:bg-main-hover cursor-pointer ${isPlaying ? 'text-green-500' : ''}`}
                onClick={() => {
                  fetchSpotify(`/me/player/play`, 'PUT', { uris: [track.uri] })
                  console.log(`Playing [track from single] "${track.name}" — ${track.uri}`, track)
                }}
              >
                <td className="px-2 w-14 text-right">
                  {isPlaying && <Volume2 fill="currentColor" strokeWidth={1} />}
                  <Heart
                    // fill="currentColor"
                    strokeWidth={2}
                  />
                </td>
                <td>{track.name}</td>
                <td>{ArtistLinks({ artists: track.artists, setContext })}</td>
                <td>{track?.album?.name}</td>
                <td>{track?.album?.year}</td>
                <td>{PopularityChart({ popularity: track.popularity })}</td>
                <td>{msToTime(track.duration_ms)}</td>
                {/* <pre>{JSON.stringify(track, null, 2)}</pre> */}
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
