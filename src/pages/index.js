import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { fetchSpotify } from '@/functions.js'
import { useRouter } from 'next/router'
import Link from 'next/link'

const NOW_PLAYING_HEIGHT = 50

const inter = Inter({ subsets: ['latin'] })

function msToTime(duration) {
  const seconds = parseInt((duration / 1000) % 60)
    .toString()
    .padStart(2, '0')
  const minutes = parseInt(duration / (1000 * 60))
  return `${minutes}:${seconds}`
}

function linkifyArtists(artists = []) {
  return artists
    .map((artist) => (
      <Link className="cursor-pointer hover:underline" key={artist.id} href={`/artist/`}>
        {artist.name}
      </Link>
    ))
    .reduce((prev, curr) => [prev, ', ', curr])
}

export default function Home() {
  const [player, setPlayer] = useState(undefined)
  const [playlists, setPlaylists] = useState([])
  const [results, setResults] = useState([])
  const [devices, setDevices] = useState([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState({})

  const router = useRouter()

  async function fetchPlaylists() {
    const data = await fetchSpotify('/me/playlists')
    setPlaylists(data.items)
  }

  async function showPlaylist(playlist) {
    const data = await fetchSpotify(`/playlists/${playlist.id}/tracks`)
    console.log({ playlist: data })
    setResults(data.items)
  }

  async function initPlayer() {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'RetroPlayer',
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      })
      setPlayer(player)
      player.addListener('ready', async ({ device_id }) => {
        console.log('Player ready')
        const currentlyPlaying = await fetchSpotify(`/me/player/currently-playing`)
        setCurrentlyPlaying(currentlyPlaying)
        // transfer playback to this device on boot if nothing is playing
        if (!currentlyPlaying?.is_playing) {
          fetchSpotify(`/me/player`, 'PUT', { device_ids: [device_id] })
        }
        const devices = await fetchSpotify(`/me/player/devices`)
        setDevices(devices.devices)
      })
      player.addListener('not_ready', ({ device_id }) => console.log('Device ID has gone offline', device_id))
      player.addListener('initialization_error', ({ message }) => console.error(message))
      player.addListener('authentication_error', ({ message }) => console.error(message))
      player.addListener('account_error', ({ message }) => console.error(message))
      player.addListener('playback_error', ({ message }) => console.error(message))
      player.addListener('player_state_changed', (state) => console.log('Player state changed', state))
      player.connect()
    }
    return true
  }

  function getToken() {
    if (typeof window === 'undefined') return
    const cookie = document.cookie
    const token = cookie
      .split(';')
      .find((cookie) => cookie.includes('access_token'))
      ?.split('=')[1]

    // const token =
    //   'BQDQtxgatsyrFaMkDP3pXsmUj5qeOV-Qnh4cg2v8Cc_zSpoD4eywnnc-U5cCsOEFqynDilhN9GNJtFF4VEOL9wkrKmoA_C9DlPIizeR_kF_nKSSBz7seoZDIwuwJGuwbyEdI0N711QiKPorBOmqGpbGoQ6_wyM6Aj9PC-FDj4s_r9erItI2_-v3OuRp183U4SN_UUXK6'
    if (!token) {
      router.push('/login')
      return false
    }

    window.token = token
    return true
  }

  useEffect(() => {
    getToken() && initPlayer() && fetchPlaylists()
  }, [])

  return (
    <div className={`flex min-h-screen flex-col items-center justify-between h-full ${inter.className}`}>
      <nav className="flex justify-between items-center h-12 w-full border-b border-b-main-border bg-header text-black p-4">
        <div className="flex items-center">
          <div className="pr-4 mr-2">◀</div>
          <div className="pr-4 mr-2">▶</div>
          <div
            className="text-xs border border-main-border rounded-full 
          "
          >
            <input type="text" placeholder="Search" className="p-1 pl-3 rounded-full bg-text-input shadow-inner focus:outline-none focus:ring focus:border-blue-500 " />
          </div>
        </div>
        <div className="font-semibold">Spotify Premium</div>
        <div>Profile</div>
      </nav>

      <main className="flex items-center justify-center height-main w-full bg-body ">
        <div className="w-1/5 height-main">
          <div
            className="flex flex-col bg-sidebar text-sm overflow-y-scroll"
            style={{
              height: `calc(100vh - ${NOW_PLAYING_HEIGHT}px)`,
            }}
          >
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Main</h2>
              <ul>
                <li className="px-4">What&apos;s New</li>
                <li className="px-4">People</li>
                <li className="px-4">Inbox</li>
                <li className="px-4">Play Queue</li>
                <li className="px-4">Devices</li>
              </ul>
            </div>
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Apps</h2>
              <ul>
                <li className="px-4">App Finder</li>
                <li className="px-4">Top Lists</li>
                <li className="px-4">Radio</li>
              </ul>
            </div>
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Collection</h2>
              <ul>
                <li className="px-4">Library</li>
                <li className="px-4">Local Files</li>
                <li className="px-4">Downloads</li>
                <li className="px-4">♥ Liked Songs</li>
              </ul>
            </div>
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Playlists</h2>
              <ul>
                {playlists.map((playlist) => (
                  <li
                    key={playlist.id}
                    className="px-4 overflow-ellipsis overflow-hidden whitespace-nowrap hover:bg-sidebar-hover cursor-pointer"
                    onClick={() => showPlaylist(playlist)}
                    onDoubleClick={() => fetchSpotify(`/me/player/play`, 'PUT', { context_uri: playlist.uri })}
                    // TODO if we receive 404 here, then transfer playback to this device
                  >
                    ♫ {playlist.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-1 text-sidebar-header uppercase">Devices</h2>
              <ul>
                {devices.map((device) => (
                  <li key={device.id} className="px-4">
                    {device.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="flex justify-between items-center pr-3 fixed bottom-0 h-1/5 w-1/5 overflow-hidden bg-playbar border-t border-t-main"
            style={{ height: NOW_PLAYING_HEIGHT }}
          >
            <div className="flex">
              <div className="mr-2">
                {currentlyPlaying?.item?.album?.images?.[0] && (
                  <img src={currentlyPlaying?.item?.album?.images?.[0].url} width={50} height={50} alt={currentlyPlaying?.item?.album?.name} />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <div className="whitespace-nowrap text-sm font-semibold text-white">{currentlyPlaying?.item?.name}</div>
                <div className="whitespace-nowrap text-xs text-gray-200">{currentlyPlaying?.item && linkifyArtists(currentlyPlaying?.item?.artists)}</div>
              </div>
            </div>
            <div className="text-3xl">♥</div>
          </div>
        </div>

        <div className="w-4/5 height-main bg-main text-xs overflow-y-scroll">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs bg-header text-gray-800">
                <th className="p-1 border-r border-r-gray-500"></th>
                <th className="p-1 border-r border-r-gray-500">Title</th>
                <th className="p-1 border-r border-r-gray-500">Title</th>
                <th className="p-1 border-r border-r-gray-500">Artist</th>
                <th className="p-1 border-r border-r-gray-500">Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((track) => (
                <tr key={track.track.id} className="hover:bg-main-hover cursor-pointer" onClick={() => fetchSpotify(`/me/player/play`, 'PUT', { uris: [track.track.uri] })}>
                  {/* <td>{track.track.album.images[0] && <img src={track.track.album.images?.[0].url} width={32} height={32} />}</td> */}
                  <td
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('track', track)
                    }}
                    className="underline"
                  >
                    Log
                  </td>
                  <td>♥</td>
                  <td>{track.track.name}</td>
                  <td>{linkifyArtists(track.track.artists)}</td>
                  <td>{track.track.album.name}</td>
                  <td>{msToTime(track.track.duration_ms)}</td>
                  {/* <pre>{JSON.stringify(track.track, null, 2)}</pre> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
