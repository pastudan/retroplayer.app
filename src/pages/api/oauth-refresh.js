// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET

export default async function handler(req, res) {
  const tokens = req.cookies.tokens
  if (!tokens) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  const { refreshToken } = JSON.parse(tokens)

  const spotifyRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + new Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = await spotifyRes.json()

  const jsonTokens = JSON.stringify({
    accessToken: data.access_token,
    refreshToken: refreshToken,
    expires: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  })
  res.setHeader('Set-Cookie', `tokens=${jsonTokens}; path=/`)
  res.status(200).json({ message: 'Success' })
}
