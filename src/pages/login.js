import { useRouter } from 'next/router'

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const origin = process.env.NEXT_PUBLIC_ORIGIN

const scopes = [
  'streaming',
  // 'user-modify-playback-state',
  // 'openid',
  'user-read-email ',
  'user-read-private',

  // 'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  // 'app-remote-control',
  // 'streaming',
  // // 'Playlists',
  // 'playlist-read-private',
  // 'playlist-read-collaborative',
  // 'playlist-modify-private',
  // 'playlist-modify-public',
  // 'user-follow-modify',
  // 'user-follow-read',
  // 'user-read-playback-position',
  // 'user-top-read',
  // 'user-read-recently-played',
  // 'user-library-modify',
  // 'user-library-read',
  // 'user-read-email',
  // 'user-read-private',
  // 'user-soa-link',
  // 'user-soa-unlink',
  // 'soa-manage-entitlements',
  // 'soa-manage-partner',
  // 'soa-create-partner',
]

export default function Login() {
  const router = useRouter()
  const { code } = router.query

  const redirectUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id,
      scope: scopes.join(' '),
      redirect_uri: origin + '/api/oauth-callback',
    }).toString()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <a href={redirectUrl} className="bg-green-500 text-white p-4 rounded-lg block">
        Login with Spotify
      </a>
    </div>
  )
}
