import { z } from "zod";
import { createMovieSchema, updateMovieSchema, movieListQuery } from "../schemas/movie.schema.js";
import { createActorSchema, updateActorSchema, actorListQuery } from "../schemas/actor.schema.js";
import {
  createSeriesSchema,
  updateSeriesSchema,
  seriesListQuery,
  createSeasonSchema,
  updateSeasonSchema,
  createEpisodeSchema,
  updateEpisodeSchema,
} from "../schemas/series.schema.js";
import { addActorSchema, updateRoleSchema } from "../schemas/cast.schema.js";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../schemas/auth.schema.js";
import { saveReviewSchema, reviewListQuery } from "../schemas/review.schema.js";
import { whereToWatchQuery } from "../schemas/where-to-watch.schema.js";

// The OpenAPI document behind /docs (like Scramble in Laravel).
// Request bodies and query strings are generated from the same Zod schemas the API
// validates with, so the docs can't drift away from what the API really accepts.

type JsonSchema = Record<string, unknown> & { properties?: Record<string, JsonSchema> };

// A Zod schema as JSON Schema: what a client may SEND (the input side)
function fromZod(schema: z.ZodType): JsonSchema {
  const { $schema: _ignored, ...json } = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as JsonSchema;
  return json;
}

const json = (schema: unknown, example?: unknown) => ({
  "application/json": { schema, ...(example === undefined ? {} : { example }) },
});
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name: string) => ({ type: "array", items: ref(name) });
const pageOf = (name: string) => ({
  type: "object",
  properties: { data: arrayOf(name), meta: ref("PageMeta") },
});

function body(schema: z.ZodType, example: unknown) {
  return { required: true, content: json(fromZod(schema), example) };
}

// Every field of a query schema becomes an optional ?query parameter
function query(schema: z.ZodType) {
  return Object.entries(fromZod(schema).properties ?? {}).map(([name, s]) => ({
    name,
    in: "query",
    required: false,
    schema: s,
  }));
}

function path(name: string, description: string) {
  return { name, in: "path", required: true, description, schema: { type: "integer", minimum: 1 } };
}
const id = (what: string) => path("id", `The ${what}'s id`);

// The answers most endpoints share
const errors = {
  400: { description: "Validation failed: one message per field", content: json(ref("ValidationError")) },
  401: { description: "Not logged in (no token, or an expired one)", content: json(ref("Error")) },
  403: { description: "Logged in, but not an admin", content: json(ref("Error")) },
  404: { description: "Not found", content: json(ref("Error")) },
  409: { description: "Already exists", content: json(ref("Error")) },
};
const ok = (description: string, schema?: unknown) => ({
  description,
  ...(schema ? { content: json(schema) } : {}),
});
const noContent = { 204: { description: "Done (no body)" } };
const admin = [{ bearerAuth: [] }];
const member = [{ bearerAuth: [] }];

// The list endpoints answer with the whole array, or with one page when ?page is sent
const listOrPage = (name: string) => ({
  description: `Without ?page: every ${name.toLowerCase()} (an array). With ?page: { data, meta }.`,
  content: json({ oneOf: [arrayOf(name), pageOf(name)] }),
});

const movieExample = {
  title: "Interstellar",
  type: "Sci-Fi",
  rating: 8.7,
  director: "Christopher Nolan",
  releaseYear: 2014,
  description: "A team travels through a wormhole to find humanity a new home.",
};
const seriesExample = {
  title: "Breaking Bad",
  type: "Crime",
  rating: 9.5,
  creator: "Vince Gilligan",
  startYear: 2008,
  endYear: 2013,
};

// The reviews endpoints exist for movies and for series: one function writes both
function reviewPaths(base: "movies" | "series", what: string) {
  const tag = "Reviews";
  return {
    [`/${base}/{id}/reviews`]: {
      get: {
        tags: [tag],
        summary: `Members' reviews of a ${what}`,
        description: "The members' average and count, then the reviews, the latest first.",
        parameters: [id(what), ...query(reviewListQuery)],
        responses: { 200: ok("The stats and a page of reviews", ref("ReviewsPage")), 404: errors[404] },
      },
      put: {
        tags: [tag],
        summary: `Write or change your review of a ${what}`,
        description: "One review per member per title: sending it again changes it.",
        security: member,
        parameters: [id(what)],
        requestBody: body(saveReviewSchema, { rating: 9, comment: "One of the best ever made." }),
        responses: {
          201: ok("Your first review of it", ref("Review")),
          200: ok("Your review, changed", ref("Review")),
          400: errors[400],
          401: errors[401],
          404: errors[404],
        },
      },
      delete: {
        tags: [tag],
        summary: `Delete your review of a ${what}`,
        security: member,
        parameters: [id(what)],
        responses: { ...noContent, 401: errors[401], 404: errors[404] },
      },
    },
    [`/${base}/{id}/reviews/me`]: {
      get: {
        tags: [tag],
        summary: `Your own review of a ${what}`,
        security: member,
        parameters: [id(what)],
        responses: { 200: ok("Your review", ref("Review")), 401: errors[401], 404: errors[404] },
      },
    },
  };
}

// The cast endpoints exist for movies and for series too
function castPaths(base: "movies" | "series", what: string) {
  const tag = "Cast";
  const actorId = path("actorId", "The actor's id");
  return {
    [`/${base}/{id}/actors`]: {
      post: {
        tags: [tag],
        summary: `Add an actor to a ${what}, with their role`,
        security: admin,
        parameters: [id(what)],
        requestBody: body(addActorSchema, { actorId: 6, role: "Fischer" }),
        responses: { 201: ok("The new cast member"), 400: errors[400], 401: errors[401], 403: errors[403], 404: errors[404], 409: errors[409] },
      },
    },
    [`/${base}/{id}/actors/{actorId}`]: {
      put: {
        tags: [tag],
        summary: `Change an actor's role in a ${what}`,
        security: admin,
        parameters: [id(what), actorId],
        requestBody: body(updateRoleSchema, { role: "Robert Fischer" }),
        responses: { 200: ok("The changed cast member"), 400: errors[400], 401: errors[401], 403: errors[403], 404: errors[404] },
      },
      delete: {
        tags: [tag],
        summary: `Remove an actor from a ${what}`,
        security: admin,
        parameters: [id(what), actorId],
        responses: { ...noContent, 401: errors[401], 403: errors[403], 404: errors[404] },
      },
    },
  };
}

// Read, update and delete one row: the same shape for movies, actors, series, ...
function itemPaths(
  base: string,
  what: string,
  tag: string,
  schema: string,
  update: z.ZodType,
  updateExample: unknown,
  getDescription: string,
  { read = true }: { read?: boolean } = {},
) {
  return {
    [`/${base}/{id}`]: {
      ...(read
        ? {
            get: {
              tags: [tag],
              summary: `One ${what}`,
              description: getDescription,
              parameters: [id(what)],
              responses: { 200: ok(`The ${what}`, ref(schema)), 400: errors[400], 404: errors[404] },
            },
          }
        : {}),
      put: {
        tags: [tag],
        summary: `Update a ${what} (send only the fields to change)`,
        security: admin,
        parameters: [id(what)],
        requestBody: body(update, updateExample),
        responses: { 200: ok(`The updated ${what}`, ref(schema)), 400: errors[400], 401: errors[401], 403: errors[403], 404: errors[404] },
      },
      delete: {
        tags: [tag],
        summary: `Delete a ${what}`,
        security: admin,
        parameters: [id(what)],
        responses: { ...noContent, 401: errors[401], 403: errors[403], 404: errors[404] },
      },
    },
  };
}

// Where a movie or series can be watched legally, by country
function whereToWatchPath(base: "movies" | "series", what: string) {
  return {
    [`/${base}/{id}/where-to-watch`]: {
      get: {
        tags: ["Where to watch"],
        summary: `Where to watch a ${what}, by country`,
        description:
          "Streaming services, free ones, rentals and purchases in one country. Data from JustWatch, through TMDB; the API keeps each answer for 12 hours. Without `country`, or with one that has no offers, it answers for the US (or the first country that has any) and says which one in `country`.",
        parameters: [id(what), ...query(whereToWatchQuery)],
        responses: {
          200: ok("The offers in that country, and every country that has some", ref("WhereToWatch")),
          400: errors[400],
          404: errors[404],
          502: { description: "TMDB didn't answer", content: json(ref("Error")) },
          503: { description: "The server has no TMDB token", content: json(ref("Error")) },
        },
      },
    },
  };
}

export function buildOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Movies Platform API",
      version: "1.0.0",
      description: [
        "Movies, TV series (seasons and episodes), actors, member reviews and watchlists.",
        "",
        "**Try it:** call `POST /auth/login` with a demo account, copy the `token`, press **Authorize** and paste it.",
        "",
        "| Role | Email | Password |",
        "|---|---|---|",
        "| Admin | `admin@movies.dev` | `admin1234` |",
        "| Member | `user@movies.dev` | `user1234` |",
        "",
        "Reading is public. Reviews and the watchlist need any logged-in member; changing the catalog needs an admin.",
        "The live demo's database is shared: please keep changes small and tidy.",
      ].join("\n"),
    },
    // Relative: the docs call the same API that serves them (local or live)
    servers: [{ url: "/" }],
    tags: [
      { name: "Auth", description: "Accounts and tokens" },
      { name: "Movies" },
      { name: "Series", description: "Series, their seasons and episodes" },
      { name: "Actors" },
      { name: "Cast", description: "Who plays whom, in movies and series" },
      { name: "Reviews", description: "Members' 1 to 10 ratings and comments" },
      { name: "Watchlist", description: "Each member's saved titles" },
      { name: "Where to watch", description: "Legal streaming, rental and purchase offers by country (JustWatch data via TMDB)" },
      { name: "Admin", description: "Admins only" },
      { name: "System" },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Is the API up, and can it reach the database?",
          responses: { 200: ok("Up", { type: "object", properties: { status: { const: "ok" } } }) },
        },
      },

      // ---------- Auth ----------
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Create an account (always a member, never an admin)",
          requestBody: body(registerSchema, { name: "Sam", email: "sam@example.com", password: "secret123" }),
          responses: { 201: ok("The account and a token", ref("AuthResult")), 400: errors[400], 409: errors[409] },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in and get a token (valid 7 days)",
          description: "After 10 failed tries for the same email, logins for it pause for 15 minutes (429).",
          requestBody: body(loginSchema, { email: "admin@movies.dev", password: "admin1234" }),
          responses: {
            200: ok("The user and a token", ref("AuthResult")),
            400: errors[400],
            401: { description: "Wrong email or password", content: json(ref("Error")) },
            429: { description: "Too many failed tries", content: json(ref("Error")) },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "The logged-in user",
          security: member,
          responses: { 200: ok("The user", ref("User")), 401: errors[401] },
        },
        put: {
          tags: ["Auth"],
          summary: "Change your name",
          security: member,
          requestBody: body(updateProfileSchema, { name: "Sam Smith" }),
          responses: { 200: ok("The user with the new name", ref("User")), 400: errors[400], 401: errors[401] },
        },
      },
      "/auth/me/password": {
        put: {
          tags: ["Auth"],
          summary: "Change your password (needs the current one)",
          description:
            "A wrong current password is a 400 on `currentPassword`. After 10 wrong tries the account waits 15 minutes (429).",
          security: member,
          requestBody: body(changePasswordSchema, { currentPassword: "user1234", newPassword: "a-new-secret" }),
          responses: { ...noContent, 400: errors[400], 401: errors[401], 429: { description: "Too many wrong tries", content: json(ref("Error")) } },
        },
      },
      "/auth/me/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "Everything you reviewed, the latest first",
          security: member,
          parameters: query(reviewListQuery),
          responses: { 200: ok("A page of your reviews, each with its movie or series"), 401: errors[401] },
        },
      },

      // ---------- Movies ----------
      "/movies": {
        get: {
          tags: ["Movies"],
          summary: "List movies: search, filter, sort, page",
          parameters: query(movieListQuery),
          responses: { 200: listOrPage("Movie"), 400: errors[400] },
        },
        post: {
          tags: ["Movies"],
          summary: "Create a movie",
          security: admin,
          requestBody: body(createMovieSchema, movieExample),
          responses: { 201: ok("The new movie", ref("Movie")), 400: errors[400], 401: errors[401], 403: errors[403] },
        },
      },
      ...itemPaths("movies", "movie", "Movies", "Movie", updateMovieSchema, { rating: 8.8 }, "The movie with its cast and their roles."),
      ...castPaths("movies", "movie"),
      ...reviewPaths("movies", "movie"),
      ...whereToWatchPath("movies", "movie"),

      // ---------- Series ----------
      "/series": {
        get: {
          tags: ["Series"],
          summary: "List series, each with its number of seasons and episodes",
          parameters: query(seriesListQuery),
          responses: { 200: listOrPage("Series"), 400: errors[400] },
        },
        post: {
          tags: ["Series"],
          summary: "Create a series (endYear null = still running)",
          security: admin,
          requestBody: body(createSeriesSchema, seriesExample),
          responses: { 201: ok("The new series", ref("Series")), 400: errors[400], 401: errors[401], 403: errors[403] },
        },
      },
      ...itemPaths("series", "series", "Series", "Series", updateSeriesSchema, { endYear: null }, "The series with its seasons (each with its episodes) and its cast. Deleting it removes its seasons and episodes."),
      "/series/{id}/seasons": {
        post: {
          tags: ["Series"],
          summary: "Add a season (its number is unique in the series)",
          security: admin,
          parameters: [id("series")],
          requestBody: body(createSeasonSchema, { number: 6, title: "The Final Season", releaseYear: 2014 }),
          responses: { 201: ok("The new season", ref("Season")), 400: errors[400], 401: errors[401], 403: errors[403], 404: errors[404], 409: errors[409] },
        },
      },
      ...itemPaths("seasons", "season", "Series", "Season", updateSeasonSchema, { title: "Part 2" }, "", { read: false }),
      "/seasons/{id}/episodes": {
        post: {
          tags: ["Series"],
          summary: "Add an episode (its number is unique in the season)",
          security: admin,
          parameters: [id("season")],
          requestBody: body(createEpisodeSchema, { number: 1, title: "Pilot", airDate: "2008-01-20", runtime: 58 }),
          responses: { 201: ok("The new episode", ref("Episode")), 400: errors[400], 401: errors[401], 403: errors[403], 404: errors[404], 409: errors[409] },
        },
      },
      ...itemPaths("episodes", "episode", "Series", "Episode", updateEpisodeSchema, { runtime: 47 }, "", { read: false }),
      ...castPaths("series", "series"),
      ...reviewPaths("series", "series"),
      ...whereToWatchPath("series", "series"),

      // ---------- Actors ----------
      "/actors": {
        get: {
          tags: ["Actors"],
          summary: "List actors A to Z: search, page",
          parameters: query(actorListQuery),
          responses: { 200: listOrPage("Actor"), 400: errors[400] },
        },
        post: {
          tags: ["Actors"],
          summary: "Create an actor (birthday YYYY-MM-DD, not in the future)",
          security: admin,
          requestBody: body(createActorSchema, { name: "Cillian Murphy", birthday: "1976-05-25", nationality: "Irish" }),
          responses: { 201: ok("The new actor", ref("Actor")), 400: errors[400], 401: errors[401], 403: errors[403] },
        },
      },
      ...itemPaths("actors", "actor", "Actors", "Actor", updateActorSchema, { nationality: "Irish" }, "The actor with their movies and series, and the role in each."),

      // ---------- Reviews (admin) and watchlist ----------
      "/reviews/{id}": {
        delete: {
          tags: ["Reviews"],
          summary: "Remove anyone's review (admins)",
          security: admin,
          parameters: [id("review")],
          responses: { ...noContent, 401: errors[401], 403: errors[403], 404: errors[404] },
        },
      },
      "/admin/stats": {
        get: {
          tags: ["Admin"],
          summary: "Numbers for the admin dashboard",
          description:
            "Counts of everything, the members' top rated and most saved titles, the latest reviews and the newest members.",
          security: admin,
          responses: { 200: ok("The dashboard numbers"), 401: errors[401], 403: errors[403] },
        },
      },
      "/watchlist": {
        get: {
          tags: ["Watchlist"],
          summary: "Your watchlist, the latest first",
          security: member,
          responses: { 200: ok("Your saved movies and series", ref("Watchlist")), 401: errors[401] },
        },
      },
      ...Object.fromEntries(
        (["movies", "series"] as const).map((base) => [
          `/watchlist/${base}/{id}`,
          {
            put: {
              tags: ["Watchlist"],
              summary: `Save a ${base === "movies" ? "movie" : "series"} (safe to repeat)`,
              security: member,
              parameters: [id(base === "movies" ? "movie" : "series")],
              responses: { ...noContent, 401: errors[401], 404: errors[404] },
            },
            delete: {
              tags: ["Watchlist"],
              summary: `Take a ${base === "movies" ? "movie" : "series"} off (safe to repeat)`,
              security: member,
              parameters: [id(base === "movies" ? "movie" : "series")],
              responses: { ...noContent, 401: errors[401], 404: errors[404] },
            },
          },
        ]),
      ),
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "The token from POST /auth/login" },
      },
      schemas: {
        Error: { type: "object", properties: { message: { type: "string" } } },
        ValidationError: {
          type: "object",
          properties: {
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: { type: "object", properties: { field: { type: "string" }, message: { type: "string" } } },
              example: [{ field: "rating", message: "Rating must be between 1 and 10" }],
            },
          },
        },
        PageMeta: {
          type: "object",
          properties: {
            page: { type: "integer" },
            perPage: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            role: { enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AuthResult: { type: "object", properties: { user: ref("User"), token: { type: "string" } } },
        Movie: { type: "object", properties: { id: { type: "integer" }, ...fromZod(createMovieSchema).properties } },
        Series: {
          type: "object",
          properties: {
            id: { type: "integer" },
            ...fromZod(createSeriesSchema).properties,
            seasonCount: { type: "integer", description: "In lists" },
            episodeCount: { type: "integer", description: "In lists" },
          },
        },
        Season: { type: "object", properties: { id: { type: "integer" }, seriesId: { type: "integer" }, ...fromZod(createSeasonSchema).properties } },
        Episode: { type: "object", properties: { id: { type: "integer" }, seasonId: { type: "integer" }, ...fromZod(createEpisodeSchema).properties } },
        Actor: { type: "object", properties: { id: { type: "integer" }, ...fromZod(createActorSchema).properties } },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer" },
            rating: { type: "integer", minimum: 1, maximum: 10 },
            comment: { type: ["string", "null"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            user: { type: "object", properties: { id: { type: "integer" }, name: { type: "string" } } },
          },
        },
        ReviewsPage: {
          type: "object",
          properties: {
            stats: {
              type: "object",
              properties: { average: { type: ["number", "null"] }, count: { type: "integer" } },
            },
            data: arrayOf("Review"),
            meta: ref("PageMeta"),
          },
        },
        Provider: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string", examples: ["Netflix"] },
            logo: { type: ["string", "null"], format: "uri" },
          },
        },
        WhereToWatch: {
          type: "object",
          properties: {
            country: { type: "string", examples: ["SA"] },
            countries: { type: "array", items: { type: "string" } },
            link: { type: ["string", "null"], format: "uri" },
            stream: arrayOf("Provider"),
            free: arrayOf("Provider"),
            ads: arrayOf("Provider"),
            rent: arrayOf("Provider"),
            buy: arrayOf("Provider"),
          },
        },
        Watchlist: {
          type: "object",
          properties: { movies: arrayOf("Movie"), series: arrayOf("Series") },
        },
      },
    },
  };
}
