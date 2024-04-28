import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { fetchSpotify } from '@/functions.js'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [player, setPlayer] = useState(undefined)
  const [playlists, setPlaylists] = useState([])
  const [results, setResults] = useState([])

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
      player.addListener('ready', ({ device_id }) => console.log('Ready with Device ID', device_id))
      player.addListener('not_ready', ({ device_id }) => console.log('Device ID has gone offline', device_id))
      player.addListener('initialization_error', ({ message }) => console.error(message))
      player.addListener('authentication_error', ({ message }) => console.error(message))
      player.addListener('account_error', ({ message }) => console.error(message))
      player.addListener('playback_error', ({ message }) => console.error(message))
      player.addListener('player_state_changed', (state) => console.log('Player state changed', state))
      player.connect()
    }
  }

  function getToken() {
    if (typeof window === 'undefined') return
    const cookie = document.cookie
    const token = cookie
      .split(';')
      .find((cookie) => cookie.includes('access_token'))
      .split('=')[1]
    window.token = token
  }

  useEffect(() => {
    getToken()
    initPlayer()
    fetchPlaylists()
  }, [])

  return (
    <div className={`flex min-h-screen flex-col items-center justify-between h-full ${inter.className}`}>
      <nav className="flex justify-between items-center h-12 w-full border-b border-b-border bg-header text-black p-4">
        <div className="flex items-center">
          <div className="pr-4 mr-2">◀</div>
          <div className="pr-4 mr-2">▶</div>
          <div
            className="text-xs border border-border rounded-full 
          "
          >
            <input type="text" placeholder="Search" className="p-1 pl-3 rounded-full bg-text-input shadow-inner focus:outline-none focus:ring focus:border-blue-500 " />
          </div>
        </div>
        <div className="font-semibold">Spotify Premium</div>
        <div>Profile</div>
      </nav>

      <main className="flex items-center justify-center height-main w-full bg-body ">
        <div className="flex flex-col height-main w-1/5 bg-sidebar border-r border-r-border text-sm overflow-y-scroll">
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
              <li className="px-4">Starred</li>
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
                  onDoubleClick={() => fetchSpotify(`/me/player/play`, 'PUT', { json: { context_uri: playlist.uri } })}
                >
                  {playlist.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-4/5 height-main bg-main">
          {results.map((track) => (
            <div key={track.track.id} className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center">
                <div className="ml-3">
                  <div>{track.track.name}</div>
                  <div>{track.track.artists.map((artist) => artist.name).join(', ')}</div>
                </div>
              </div>
              <div>
                <button onClick={() => player.play({ uris: [track.track.uri] })} className="bg-green text-white px-3 py-1 rounded-full">
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
