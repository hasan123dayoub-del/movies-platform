import type {
  Movie,
  MovieWithActors,
  MovieInput,
  Actor,
  ActorWithMovies,
  ActorInput,
} from "./types";

const API_URL = process.env.API_URL;

// ---------- Movies ----------

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/movies`);
  if (!res.ok) {
    throw new Error("Failed to load movies");
  }
  return res.json();
}

// Returns null when the movie doesn't exist, so the page can show a 404
export async function getMovie(id: number): Promise<MovieWithActors | null> {
  const res = await fetch(`${API_URL}/movies/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to load movie");
  }
  return res.json();
}

export async function createMovie(data: MovieInput): Promise<Movie> {
  const res = await fetch(`${API_URL}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create movie");
  }
  return res.json();
}

export async function updateMovie(
  id: number,
  data: Partial<MovieInput>,
): Promise<Movie> {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update movie");
  }
  return res.json();
}

export async function deleteMovie(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/movies/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete movie");
  }
}

// ---------- Actors ----------

export async function getActors(): Promise<Actor[]> {
  const res = await fetch(`${API_URL}/actors`);
  if (!res.ok) {
    throw new Error("Failed to load actors");
  }
  return res.json();
}

// Returns null when the actor doesn't exist, so the page can show a 404
export async function getActor(id: number): Promise<ActorWithMovies | null> {
  const res = await fetch(`${API_URL}/actors/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to load actor");
  }
  return res.json();
}

export async function createActor(data: ActorInput): Promise<Actor> {
  const res = await fetch(`${API_URL}/actors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create actor");
  }
  return res.json();
}

export async function updateActor(
  id: number,
  data: Partial<ActorInput>,
): Promise<Actor> {
  const res = await fetch(`${API_URL}/actors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update actor");
  }
  return res.json();
}

export async function deleteActor(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/actors/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete actor");
  }
}
