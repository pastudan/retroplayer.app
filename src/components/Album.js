import { fetchSpotify, msToTime, ALBUM_ART_WIDTH } from '@/functions.js'
import { useState, useEffect } from 'react'
import { Clipboard, Heart, Volume2 } from 'lucide-react'
import ArtistLinks from '@/components/ArtistLinks.js'
import PopularityChart from '@/components/PopularityChart.js'

const DEFAULT_ALBUM_URL = '/album-placeholder.png'

export default function Album({ album, context, setContext, showYear = false, currentTrack, showArtwork = true, showTitle = false }) {
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    fetchSpotify(`/albums/${album.id}/tracks`).then((data) => {
      console.log('tracks', data)
      setTracks(data.items)
    })
  }, [album])

  return (
    <div className="mt-4 mx-4 flex">
      {showArtwork && (
        <div
          style={{
            width: ALBUM_ART_WIDTH,
            height: ALBUM_ART_WIDTH,
            backgroundImage: `url(${album.images?.[0]?.url || DEFAULT_ALBUM_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
          }}
        />
      )}
      <div className="w-full ml-4">
        <h2 className="group flex items-center mb-2">
          <span className="text-base">{album.name}</span>
          <span className="text-base text-stone-500 ml-2">({new Date(album.release_date).getFullYear()})</span>
          <a
            className="ml-2 hidden group-hover:block hover:underline cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(album.external_urls.spotify)
            }}
          >
            <Clipboard />
            Share
          </a>
        </h2>
        <table className="w-full">
          {/* <thead> */}
          {/* <tr className="text-left text-xs  text-gray-800"> */}
          {/* <th className="p-1"></th> */}
          {/* <th className="p-1">Title</th> */}
          {/* <th className="p-1">Artist</th> */}
          {/* <th className="p-1">Popularity</th> */}
          {/* <th className="p-1">Time</th> */}
          {/* </tr> */}
          {/* </thead> */}
          <tbody>
            {tracks.map((track) => {
              const isPlaying = currentTrack === track.uri
              return (
                <tr
                  key={track.id}
                  className={`hover:bg-main-hover cursor-pointer ${isPlaying ? 'text-green-500' : ''}`}
                  onClick={() => {
                    fetchSpotify(`/me/player/play`, 'PUT', {
                      offset: { uri: track.uri },
                      context_uri: album.uri,
                    })
                    console.log(`Playing [track within album] "${track.name}" — ${track.uri}`, track)
                  }}
                >
                  <td className="px-2 w-14 text-right">
                    {isPlaying && <Volume2 fill="currentColor" strokeWidth={1} />}
                    <Heart
                      // fill="currentColor"
                      strokeWidth={2}
                    />
                  </td>
                  <td className="w-2/5">{track.name}</td>
                  <td className="w-2/5">{ArtistLinks({ artists: track.artists, setContext })}</td>
                  {/* <td>{PopularityChart({ popularity: track.popularity })}</td> */}
                  <td>{msToTime(track.duration_ms)}</td>
                  {/* <pre>{JSON.stringify(track, null, 2)}</pre> */}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
