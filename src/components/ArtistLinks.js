export default function ArtistLinks({ artists = [], setContext, ignore }) {
  if (!artists.length) return null
  return artists
    .map(
      (artist) =>
        artist.id !== ignore && (
          <a
            className="cursor-pointer hover:underline"
            key={artist.id}
            onClick={(e) => {
              e.stopPropagation()
              setContext({ type: 'artist', ...artist })
              // fetchSpotify(`/artists/${artist.id}/top-tracks`).then((data) => setResults(data.tracks))
              // fetchSpotify(`/artists/${artist.id}/albums`).then((data) => setAlbums(data.items))
            }}
          >
            {artist.name}
          </a>
        )
    )
    .filter(Boolean)
    .reduce((prev, curr) => [prev, ', ', curr])
}
