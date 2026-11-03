export type Movie = {
  id: number;
  title: string;
  type: string;
  rating: number;
  director: string;
  posterUrl: string | null;
  createdAt: string;
};

export type Actor = {
  id: number;
  name: string;
  birthday: string;
  nationality: string;
};

// The movie as returned by GET /movies/:id (with its cast)
export type MovieWithActors = Movie & {
  actors: { role: string; actor: Actor }[];
};

// The actor as returned by GET /actors/:id (with their movies)
export type ActorWithMovies = Actor & {
  movies: { role: string; movie: Movie }[];
};

// What we send when creating or updating (no id, no createdAt)
export type MovieInput = Omit<Movie, "id" | "createdAt">;
export type ActorInput = Omit<Actor, "id">;
