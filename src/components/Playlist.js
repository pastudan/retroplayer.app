import { fetchSpotify, msToTime } from '@/functions.js'
import { useState, useEffect } from 'react'
import { Heart, Volume2 } from 'lucide-react'
import ArtistLinks from '@/components/ArtistLinks.js'
import PopularityChart from '@/components/PopularityChart.js'

export default function PlaylistTracks({ context, setContext, currentTrack }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    fetchSpotify(`/playlists/${context.id}/tracks`).then((data) => setResults(data.items))
  }, [context])

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-xs bg-header text-gray-800">
          <th className="p-1 border-r border-r-gray-500"></th>
          <th className="p-1 border-r border-r-gray-500">Title</th>
          <th className="p-1 border-r border-r-gray-500">Artist</th>
          <th className="p-1 border-r border-r-gray-500">Album</th>
          <th className="p-1 border-r border-r-gray-500">Popularity</th>
          <th className="p-1 border-r border-r-gray-500">Time</th>
        </tr>
      </thead>
      <tbody>
        {results.map((track) => {
          track = track.track || track
          const isPlaying = currentTrack === track.uri
          return (
            <tr
              key={track.id}
              className={`hover:bg-main-hover cursor-pointer ${isPlaying ? 'text-green-500' : ''}`}
              onClick={() => {
                fetchSpotify(`/me/player/play`, 'PUT', {
                  offset: { uri: track.uri },
                  context_uri: context?.uri,
                })
                console.log(`Playing [track] "${track.name}" — ${track.uri} (Context: ${context.uri})`, track)
              }}
            >
              {/* <td>{track.album.images[0] && <img src={track.album.images?.[0].url} width={32} height={32} />}</td> */}
              {/* <td
            onClick={(e) => {
              e.stopPropagation()
              console.log('track', track)
            }}
            className="underline"
            >
            Log
          </td> */}
              <td className="px-2 w-14 text-right">
                {isPlaying && <Volume2 fill="currentColor" strokeWidth={1} />}
                <Heart
                  // fill="currentColor"
                  strokeWidth={2}
                />
              </td>
              <td>{track.name}</td>
              <td>{ArtistLinks({ artists: track.artists, setContext })}</td>
              <td>{track.album.name}</td>
              <td>{PopularityChart({ popularity: track.popularity })}</td>
              <td>{msToTime(track.duration_ms)}</td>
              {/* <pre>{JSON.stringify(track, null, 2)}</pre> */}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
