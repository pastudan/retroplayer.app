import { useEffect, useState } from 'react'

export default function Artist({ id }) {
  const [singles, setSingles] = useState([])
  const [albums, setAlbums] = useState([])

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3100/discography')
    eventSource.addEventListener('error', () => {
      throw new Error('Failed to fetch')
    })
    eventSource.addEventListener('done', () => eventSource.close())
    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      if (data.albums) setAlbums((albums) => [...albums, ...data.albums])
      if (data.singles) setSingles((singles) => [...singles, ...data.singles])
    })
    // As the component unmounts, close listener to SSE API
    return () => eventSource.close()
  }, [])

  return (
    <div>
      <h2>Artist Discography</h2>
      <h3>Singles</h3>
      <ul>
        {singles.map((single) => {
          return <li key={single.name}>{single.name}</li>
        })}
      </ul>
      <h3>Albums</h3>
      <ul>
        {albums.map((album) => {
          return <li key={album.name}>{album.name}</li>
        })}
      </ul>
    </div>
  )
}
