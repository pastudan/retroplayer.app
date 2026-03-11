import { useEffect, useState, useRef } from 'react'
import { fetchSpotify, getTokens, startPKCELogin, handlePKCECallback, DEFAULT_ARTIST_URL, isTauri } from '@/functions.js'
import { Router, Switch, Route, Redirect, useLocation } from 'wouter'

import { Volume2, MonitorSpeaker, Heart, ListEnd, Sparkles, Inbox, Users, Music, AppWindowMac, MicVocal, BoomBox, Library, WifiOff, Download } from 'lucide-react'

import Playlist from '@/components/Playlist.jsx'
import Artist from '@/components/Artist.jsx'
import TrafficLights from '@/components/TrafficLights.jsx'

const NOW_PLAYING_HEIGHT = 50

function OAuthCallback({ onSuccess }) {
  const [, navigate] = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      handlePKCECallback(code)
        .then(() => {
          navigate('/', { replace: true })
          onSuccess()
        })
        .catch(console.error)
    }
  }, [])

  return <div className="flex items-center justify-center h-screen text-sm">Connecting to Spotify…</div>
}

function MainApp() {
  const [player, setPlayer] = useState(undefined)
  const [playlists, setPlaylists] = useState([])
  const [context, setContext] = useState({ type: 'whats-new' })
  const [devices, setDevices] = useState([])
  const [profile, setProfile] = useState(null)
  const navRef = useRef(null)

  // Manual drag: more reliable than data-tauri-drag-region on transparent windows
  useEffect(() => {
    if (!isTauri()) return
    const nav = navRef.current
    if (!nav) return
    const NO_DRAG = 'input, button, a, [role="button"]'
    const onMouseDown = async (e) => {
      if (e.target.closest(NO_DRAG)) return
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      getCurrentWindow().startDragging()
    }
    nav.addEventListener('mousedown', onMouseDown)
    return () => nav.removeEventListener('mousedown', onMouseDown)
  }, [])

  async function initPlayer() {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'RetroPlayer',
        getOAuthToken: (cb) => cb(window.accessToken),
        volume: 0.5,
      })
      spotifyPlayer.addListener('ready', async ({ device_id }) => {
        const currentlyPlaying = await fetchSpotify(`/me/player/currently-playing`)
        if (!currentlyPlaying?.is_playing) fetchSpotify(`/me/player`, 'PUT', { device_ids: [device_id] })
        fetchSpotify(`/me/player/devices`).then((devices) => setDevices(devices.devices))
      })
      spotifyPlayer.addListener('not_ready', ({ device_id }) => console.log('Device ID has gone offline', device_id))
      spotifyPlayer.addListener('initialization_error', ({ message }) => console.error(message))
      spotifyPlayer.addListener('authentication_error', ({ message }) => console.error(message))
      spotifyPlayer.addListener('account_error', ({ message }) => console.error(message))
      spotifyPlayer.addListener('playback_error', ({ message }) => console.error(message))
      spotifyPlayer.addListener('player_state_changed', setPlayer)
      spotifyPlayer.connect()
    }
  }

  function boot() {
    if (getTokens()) {
      initPlayer()
      fetchSpotify('/me/playlists').then((data) => setPlaylists(data.items))
      fetchSpotify('/me').then(setProfile)
    }
  }

  useEffect(() => {
    boot()
  }, [])

  const currentTrack = player?.track_window?.current_track?.uri

  // When context changes, update the in-memory route
  const [, navigate] = useLocation()
  useEffect(() => {
    if (context.type === 'artist') navigate(`/artist/${context.id}`)
    else if (context.type === 'playlist') navigate(`/playlist/${context.id}`)
    else navigate('/whats-new')
  }, [context])

  return (
    <div className="flex min-h-screen flex-col items-center justify-between h-full">
      <nav
        ref={navRef}
        className="flex justify-between items-center h-12 w-full border-b border-b-main-border bg-header text-black p-4"
        style={isTauri() ? { cursor: 'default', userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
      >
        <div className="flex items-center w-1/3">
          {isTauri() && <TrafficLights />}
          <div className="pr-4 mr-2">◀</div>
          <div className="pr-4 mr-2">▶</div>
          <div className="text-xs border border-main-border rounded-full">
            <input type="text" placeholder="Search" className="p-1 pl-3 rounded-full bg-text-input shadow-inner focus:outline-none focus:ring focus:border-blue-500" />
          </div>
        </div>
        <div className="font-semibold text-sm w-1/3 flex justify-center">Spotify Premium</div>
        <div className="w-1/3 flex justify-end">
          {profile ? (
            <div className="p-px bg-white shadow" title={profile?.display_name}>
              <img src={profile?.images?.[0]?.url || DEFAULT_ARTIST_URL} width={32} height={32} alt={profile?.display_name} />
            </div>
          ) : (
            <button onClick={startPKCELogin} className="bg-green-600 text-white px-2 py-1 rounded-lg text-sm cursor-pointer">
              Login with Spotify
            </button>
          )}
        </div>
      </nav>

      <main className="flex items-center justify-center height-main w-full bg-body">
        <div className="w-1/5 height-main">
          <div
            className="flex flex-col bg-sidebar text-sm overflow-y-scroll"
            style={{ height: `calc(100vh - ${NOW_PLAYING_HEIGHT}px)` }}
          >
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Main</h2>
              <ul>
                <li className={`px-3 ${context?.type === 'whats-new' ? 'bg-sidebar-selected' : ''}`}>
                  <Sparkles />
                  What&apos;s New
                </li>
                <li className="px-3">
                  <Users />
                  People
                </li>
                <li className="px-3">
                  <Inbox />
                  Inbox
                </li>
                <li className="px-3">
                  <ListEnd />
                  Play Queue
                </li>
                <li className="px-3">
                  <MonitorSpeaker />
                  Devices
                </li>
              </ul>
            </div>
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Apps</h2>
              <ul>
                <li className="px-3">
                  <AppWindowMac />
                  App Finder
                </li>
                <li className="px-3">
                  <MicVocal />
                  Top Lists
                </li>
                <li className="px-3">
                  <BoomBox />
                  Radio
                </li>
              </ul>
            </div>
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Collection</h2>
              <ul>
                <li className="px-3">
                  <Library />
                  Library
                </li>
                <li className="px-3">
                  <WifiOff />
                  Local Files
                </li>
                <li className="px-3">
                  <Download />
                  Downloads
                </li>
                <li className="px-3">
                  <Heart fill="currentColor" />
                  Liked Songs
                </li>
              </ul>
            </div>
            <div className="mt-3 mb-3 mx-3">
              <h2 className="mb-1 text-sidebar-header uppercase">Playlists</h2>
              <ul>
                {playlists.map((playlist) => {
                  const isPlaying = player?.context?.uri === playlist.uri
                  return (
                    <li
                      key={playlist.id}
                      className={`px-3 flex justify-between overflow-ellipsis overflow-hidden whitespace-nowrap hover:bg-sidebar-hover cursor-pointer rounded ${
                        isPlaying ? 'text-green-500' : ''
                      } ${context?.uri === playlist.uri ? 'bg-sidebar-selected' : ''}`}
                      onClick={() => setContext({ type: 'playlist', ...playlist })}
                      onDoubleClick={() => {
                        fetchSpotify(`/me/player/play`, 'PUT', { context_uri: playlist.uri })
                      }}
                    >
                      <span>
                        <Music /> {playlist.name}
                      </span>
                      <span>{isPlaying && <Volume2 fill="currentColor" />}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="mt-3 mb-3 mx-3">
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
              <div className="mr-2"></div>
              <div className="flex flex-col justify-center"></div>
            </div>
            <div className="text-3xl">
              <Heart className="w-12" />
            </div>
          </div>
        </div>

        <div className="w-4/5 height-main bg-main text-xs overflow-y-scroll">
          <Switch>
            <Route path="/artist/:id">{() => <Artist {...{ context, setContext, currentTrack }} />}</Route>
            <Route path="/playlist/:id">{() => <Playlist {...{ context, setContext, currentTrack }} />}</Route>
            <Route path="/whats-new">What&apos;s New</Route>
            <Route>
              <Redirect to="/whats-new" />
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const [booted, setBooted] = useState(false)

  return (
    <Router>
      <Switch>
        <Route path="/callback">
          <OAuthCallback onSuccess={() => setBooted((b) => !b)} />
        </Route>
        <Route>
          <MainApp key={booted} />
        </Route>
      </Switch>
    </Router>
  )
}
