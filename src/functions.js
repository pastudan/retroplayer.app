const token = process.env.NEXT_PUBLIC_TEST_ACCESS_TOKEN

export async function fetchSpotify(url, method, json) {
  const res = await fetch(`https://api.spotify.com/v1${url}`, {
    headers: { Authorization: `Bearer ${window.token}`, 'Content-Type': 'application/json' },
    method: method || 'GET',
    body: json ? JSON.stringify(json) : undefined,
  })
  if (res.status > 200 && res.status < 300) return
  const data = await res.json()
  if (!res.ok) {
    console.error(data)
  }
  return data
}
