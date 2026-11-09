export type Movie = {
  id: number;
  title: string;
  type: string;
  rating: number;
  director: string;
  // Older movies may not have these yet
  releaseYear: number | null;
  description: string | null;
  posterUrl: string | null;
  createdAt: string;
};

// The sort choices for the movies and series lists (the API checks the same three)
export const MOVIE_SORTS = {
  title: "A to Z",
  rating: "Top rated",
  newest: "Newest",
} as const;
export type MovieSort = keyof typeof MOVIE_SORTS;

// What a list page can filter and sort by; every field is optional
export type MovieFilters = { search?: string; type?: string; sort?: MovieSort };
// Series lists filter the same way
export type SeriesFilters = MovieFilters;

// ---------- Series ----------

export type Series = {
  id: number;
  title: string;
  type: string;
  rating: number;
  creator: string;
  startYear: number;
  // null = still running
  endYear: number | null;
  description: string | null;
  posterUrl: string | null;
  createdAt: string;
};

// In lists, each series also says how big it is
export type SeriesListItem = Series & { seasonCount: number; episodeCount: number };

export type Episode = {
  id: number;
  seasonId: number;
  number: number;
  title: string;
  // "2008-01-20T00:00:00.000Z", or null when unknown
  airDate: string | null;
  // minutes
  runtime: number | null;
  description: string | null;
};

export type Season = {
  id: number;
  seriesId: number;
  number: number;
  title: string | null;
  releaseYear: number | null;
  description: string | null;
  posterUrl: string | null;
};

export type SeasonWithEpisodes = Season & { episodes: Episode[] };

// GET /series/:id: the series with its seasons (each with episodes) and its cast
export type SeriesWithDetails = Series & {
  seasons: SeasonWithEpisodes[];
  actors: CastMember[];
};

export type SeriesInput = Omit<Series, "id" | "createdAt">;
export type SeasonInput = Omit<Season, "id" | "seriesId">;
export type EpisodeInput = Omit<Episode, "id" | "seasonId">;

export type Actor = {
  id: number;
  name: string;
  birthday: string;
  nationality: string;
  photoUrl: string | null;
};

// One actor in a movie's cast, with the role they play
export type CastMember = { role: string; actor: Actor };

// The movie as returned by GET /movies/:id (with its cast)
export type MovieWithActors = Movie & {
  actors: CastMember[];
};

// The actor as returned by GET /actors/:id (with their movies and series)
export type ActorWithMovies = Actor & {
  movies: { role: string; movie: Movie }[];
  series: { role: string; series: Series }[];
};

// What we send when creating or updating (no id, no createdAt)
export type MovieInput = Omit<Movie, "id" | "createdAt">;
export type ActorInput = Omit<Actor, "id">;
export type CastInput = { actorId: number; role: string };

// A logged-in account, as returned by the API (never includes the password)
export type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

// What register and login return
export type AuthResult = { user: User; token: string };
export type RegisterInput = { name: string; email: string; password: string };
export type LoginInput = { email: string; password: string };

// Validation errors from the API, one message per field: { rating: "Too big..." }
export type FieldErrors = Record<string, string>;

// What a form gets back from its Server Action after a failed submit:
// the errors, and what the user typed so the inputs keep it
export type FormState = {
  errors: FieldErrors;
  values: Record<string, string>;
};

// The result of a create or update: the saved item, or the errors to show
export type SaveResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

// ---------- Pagination ----------

// One page of a list, as the API sends it for ?page=2&perPage=12
export type PageMeta = { page: number; perPage: number; total: number; totalPages: number };
export type Page<T> = { data: T[]; meta: PageMeta };

// ---------- Reviews and watchlist ----------

// Reviews and watchlist items are about a movie or a series
export type TitleKind = "movie" | "series";

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  // Only the reviewer's name is public, never their email
  user: { id: number; name: string };
};

// GET /movies/:id/reviews: the members' average (null before the first rating) and a page
export type ReviewsPage = Page<Review> & { stats: { average: number | null; count: number } };

export type ReviewInput = { rating: number; comment: string | null };

// GET /watchlist: what one member saved, the latest first
export type Watchlist = {
  movies: (Movie & { addedAt: string })[];
  series: (Series & { addedAt: string })[];
};
