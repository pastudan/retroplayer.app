const token = process.env.NEXT_PUBLIC_TEST_ACCESS_TOKEN

export async function fetchSpotify(url, method, options = {}) {
  const res = await fetch(`https://api.spotify.com/v1${url}`, {
    headers: { Authorization: `Bearer ${window.token}`, 'Content-Type': 'application/json' },
    method: method || 'GET',
    body: options.json ? JSON.stringify(options.body) : undefined,
    ...options,
  })
  console.log(res.status, res.statusText)
  const data = await res.json()

  if (!res.ok) throw new Error(data.error.message)
  return data
}
