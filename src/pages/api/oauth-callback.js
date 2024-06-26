// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const origin = process.env.NEXT_PUBLIC_ORIGIN

export default async function handler(req, res) {
  const { code } = req.query

  const spotifyRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + new Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: origin + '/api/oauth-callback',
    }),
  })

  const data = await spotifyRes.json()

  const jsonTokens = JSON.stringify({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expires: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  })
  res.setHeader('Set-Cookie', `tokens=${jsonTokens}; path=/`)
  res.status(302).redirect('/')
}
