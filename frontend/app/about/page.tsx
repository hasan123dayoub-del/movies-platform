export default async function AlbumsPage() {
  const res = await fetch('https://jsonplaceholder.typicode.com/albums');
  const albums = await res.json();

  return (
    <div>
      <ul>
        {albums.map((album: { id: number; title: string }) => (
          <li key={album.id}>{album.title}</li>
        ))}
      </ul>
    </div>
  )
}