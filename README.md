# Movies Platform

[![CI](https://github.com/hasan123dayoub-del/movies-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/hasan123dayoub-del/movies-platform/actions/workflows/ci.yml)

**Live demo:** [movies-platform-web.onrender.com](https://movies-platform-web.onrender.com) · **API:** [movies-platform-api.onrender.com](https://movies-platform-api.onrender.com/health) (log in with `admin@movies.dev` / `admin1234` to see the admin area)

> Hosted on free plans: after 15 minutes without visitors the site and the API go to sleep, so the first visit can take about a minute to wake them up.

A platform for movies, TV series and actors: every movie and series has its cast, every series has its seasons and episodes, and every actor has the role they played in each. Arabic titles are shown in Arabic (right to left) next to English ones. A public site to browse them, and an admin area to manage them.

- **Backend:** Express 5 + TypeScript + Prisma 7 + PostgreSQL 17 (Docker) + Zod 4
- **Frontend:** Next.js 16 (App Router, Server Components, Server Actions) + React 19 + Tailwind CSS 4

[![The TV series page, with live search, a genre filter and sorting](docs/screenshot.jpg)](https://movies-platform-web.onrender.com/series)

## My contribution

I built this project on my own, end to end (November 2026), to apply what I learned in the Bytes4Future full-stack track (Aga Khan Foundation): TypeScript, Express, Prisma, PostgreSQL and Next.js, coming from Laravel.

- **API:** 32 REST endpoints in Express 5 + TypeScript, in layers: routes → Zod validation → controllers → services → Prisma. One error handler turns database errors into clear answers (duplicate → 409, missing → 404).
- **Database:** 8 PostgreSQL tables (movies, series, seasons, episodes, actors, two cast tables, users) across 6 migrations, with cascading deletes and unique rules (no two seasons with the same number in a series).
- **Auth:** bcrypt + JWT kept in an httpOnly cookie, `USER` / `ADMIN` roles, admin-only writes checked by the API, and a login limit that counts only failed attempts per email.
- **Website:** Next.js 16 Server Components and Server Actions; cached pages that refresh on every admin change; live search; Arabic titles shown right to left.
- **Data:** 35 movies, 16 series, 67 seasons, 1,042 episodes and 78 actors, collected from the Wikipedia and Wikidata APIs.
- **Quality:** 33 API tests (Vitest + Supertest) against a real PostgreSQL; GitHub Actions also builds the website against a running API on every push.
- **Deployment:** two Docker services on Render plus Neon PostgreSQL; migrations run on start, and the sample data is loaded only into an empty database.

## Features

**Public site**
- Home page with the top rated movies and collection stats
- All movies with **live search** (results follow what you type, titles that start with the text first), a genre filter and sorting (A to Z, top rated, newest); every choice is in the URL, so it can be shared
- A page per movie with its poster, year, description, director and cast
- TV series with the same live search, filter and sort; a page per series (years, ongoing/ended, seasons, cast) and per season (its episodes with air date and runtime)
- All actors with the same live search by name, and a page per actor with their age, filmography and average rating
- Page titles and link previews (Open Graph) per movie and actor

**Accounts**
- Register, log in and log out; the session is a JWT in an httpOnly cookie
- Two roles: `USER` and `ADMIN`. Everyone can browse; only admins can change the catalog

**Admin** (`/admin`, admins only)
- Add, edit and delete movies and actors, with a live image preview
- Manage the cast of a movie or a series: add an actor with a role, change the role, remove them
- Series: add seasons (the next number is suggested), open a season to edit it and add, edit (in place) or delete its episodes
- Validation errors from the API shown under each field

## Architecture

```
Browser ──> Next.js (Server Components + Server Actions) ──> Express API ──> PostgreSQL
```

The browser never calls the API directly: pages fetch on the server and forms submit to Server Actions, so `API_URL` stays on the server.

**Auth flow:** the API signs a JWT on login → Next.js keeps it in an httpOnly cookie (JavaScript can't read it) → every Server Action forwards it as `Authorization: Bearer` → the API checks the token and the role on every change. The admin pages check too, but the API is the real gatekeeper.

**Speed:** public reads are cached on the Next.js server (`"use cache"`), so pages are served prerendered in a few milliseconds; every admin change calls `updateTag()`, so visitors see it at once.

**Backend layers:** `routes` → `validate` (Zod) → `controllers` (HTTP only) → `services` (logic + Prisma) → `errorHandler`

```
backend/src/
├── routes/        URLs and which middleware runs on each
├── middleware/    validate (Zod), errors (one JSON error format)
├── schemas/       Zod rules and the input types inferred from them
├── controllers/   read the request, call a service, send the response
├── services/      business rules and database queries
└── lib/           Prisma client, HttpError

frontend/
├── app/           pages (public + /admin) and Server Actions
├── components/    UI pieces; components/form/ is shared by every admin form
└── lib/           API client (lib/api/), types, form and date helpers
```

## Data model

```
Movie ──< MovieActor >── Actor
          (role)
```

- **Movie:** title, type, rating, director, release year, description, poster URL
- **Actor:** name, birthday, nationality, photo URL
- **MovieActor:** links an actor to a movie with the role they played (deleting a movie or actor removes its links)
- **Series:** title, type, rating, creator, first and last year (empty = still running), description, poster URL
- **Season:** number (unique in its series), optional title, year, description, poster
- **Episode:** number (unique in its season), title, air date, runtime, description
- **SeriesActor:** links an actor to a series with their role
- **User:** name, unique email, bcrypt password hash, role (`USER` / `ADMIN`)

## Run it locally

Requirements: Node.js 24, Docker Desktop.

**1. Backend** (http://localhost:4000)

```bash
cd backend
npm install
cp .env.example .env

docker compose up -d          # PostgreSQL on port 5433
npx prisma migrate dev        # create the tables
npx prisma generate           # generate the Prisma Client
npx prisma db seed            # 78 actors, 35 movies, 16 series (67 seasons, 1,042 episodes) and the demo accounts below

npm run dev
```

**2. Frontend** (http://localhost:3000), in a second terminal

```bash
cd frontend
npm install
cp .env.example .env.local    # API_URL=http://localhost:4000
npm run dev
```

> Open `http://localhost:3000`, not the "Network" address that `next dev` also prints: in development Next.js only serves its scripts to localhost.

### Demo accounts (created by the seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@movies.dev` | `admin1234` |
| User | `user@movies.dev` | `user1234` |

New sign-ups are always regular users. To make an account an admin: `npm run make-admin -- someone@example.com` (in `backend/`).

### Scripts

| | Backend | Frontend |
|---|---|---|
| Development | `npm run dev` | `npm run dev` |
| Type check | `npm run typecheck` | `npm run typecheck` |
| Lint | | `npm run lint` |
| Tests | `npm test` (see [Tests](#tests)) | |
| Production build | `npm run build` → `dist/` | `npm run build` |
| Production start | `npm start` | `npm start` |

### Tests

The API tests (Vitest + Supertest, [`backend/tests/`](backend/tests/)) cover auth and the login limit, permissions, validation, movies, cast, series, seasons and episodes. They run against a separate `movies_test` database, never the development one, and prepare it themselves (migrations + sample data):

```bash
docker exec movies-db createdb -U movies movies_test   # once
cd backend && npm test
```

GitHub Actions runs them on every push, then builds the website against a running API ([`ci.yml`](.github/workflows/ci.yml)).

## Deployment

Both apps run on [Render](https://render.com) as Docker services in Frankfurt, described in [`render.yaml`](render.yaml). The database is [Neon](https://neon.tech) PostgreSQL in the same region.

- **API** ([`backend/Dockerfile`](backend/Dockerfile)): on every start it applies new migrations, and fills the database with the sample data only if it is empty.
- **Website** ([`frontend/Dockerfile`](frontend/Dockerfile)): pages are pre-rendered from the API at build time, so the build wakes the free API up first.
- Secrets (`DATABASE_URL`, `JWT_SECRET`) are set in the Render dashboard, never in the repo.

## API

A ready Postman collection is in [`backend/postman/`](backend/postman/movies-platform.postman_collection.json) (File → Import).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account → `{ user, token }` |
| POST | `/auth/login` | Log in → `{ user, token }` (10 failed tries per email, then a 15 minute pause) |
| GET | `/auth/me` | The logged-in user (needs the token) |
| GET | `/health` | API and database are up |
| GET | `/movies` | List movies. Optional: `?search=` (part of the title, any case), `?type=` (genre), `?sort=title|rating|newest` |
| GET | `/movies/:id` | One movie with its cast and their roles |
| POST | `/movies` | Create a movie |
| PUT | `/movies/:id` | Update a movie (any of its fields) |
| DELETE | `/movies/:id` | Delete a movie |
| POST | `/movies/:id/actors` | Add an actor to a movie with a role |
| PUT | `/movies/:id/actors/:actorId` | Change the actor's role in the movie |
| DELETE | `/movies/:id/actors/:actorId` | Remove the actor from the movie |
| GET | `/series` | List series, each with its number of seasons and episodes. Same `?search=`, `?type=`, `?sort=` as movies |
| GET | `/series/:id` | One series with its seasons (each with its episodes) and its cast |
| POST / PUT / DELETE | `/series`, `/series/:id` | Create, update, delete a series (deleting it removes its seasons and episodes) |
| POST | `/series/:id/seasons` | Add a season |
| PUT / DELETE | `/seasons/:id` | Update or delete a season |
| POST | `/seasons/:id/episodes` | Add an episode |
| PUT / DELETE | `/episodes/:id` | Update or delete an episode |
| POST / PUT / DELETE | `/series/:id/actors[/:actorId]` | The series' cast, like a movie's |
| GET | `/actors` | List actors A to Z. Optional: `?search=` (part of the name, any case) |
| GET | `/actors/:id` | One actor with their movies and roles |
| POST | `/actors` | Create an actor |
| PUT | `/actors/:id` | Update an actor (any of their fields) |
| DELETE | `/actors/:id` | Delete an actor |

Every `POST`, `PUT` and `DELETE` on movies, series, seasons, episodes, actors and casts needs an admin token: `Authorization: Bearer <token>`.

### Example bodies

```jsonc
// POST /movies (posterUrl is optional)
{ "title": "Interstellar", "type": "Sci-Fi", "rating": 8.7, "director": "Christopher Nolan", "releaseYear": 2014,
  "description": "A team travels through a wormhole to find humanity a new home." }

// POST /actors (birthday is YYYY-MM-DD and can't be in the future)
{ "name": "Cillian Murphy", "birthday": "1976-05-25", "nationality": "Irish" }

// POST /movies/:id/actors
{ "actorId": 6, "role": "Fischer" }
```

### Errors

Every error is returned as JSON.

| Status | When |
|---|---|
| 400 | Invalid body, invalid id in the URL, or broken JSON. The response lists each invalid field. |
| 401 | Not logged in, or the token is invalid or expired |
| 403 | Logged in, but not an admin |
| 404 | The movie, actor, cast member or route does not exist |
| 409 | The actor is already in the cast, a season/episode number is already used, or the email already has an account |
| 413 | The request body is larger than 100 KB |
| 429 | Too many failed logins for this email |
| 500 | Unexpected server error (details are logged on the server, never sent to the client) |

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "rating", "message": "Rating can't be above 10" }]
}
```

Sample data sources: posters and photos are linked from Wikimedia; actor birthdays come from Wikidata; episode lists (titles, air dates, and the Arabic episode plots) come from English and Arabic Wikipedia (text under CC BY-SA). A few images stand in where no official poster is free to use (e.g. a photo of Saladin's statue in Damascus for the 2001 series).

## Roadmap

- [x] Search, filters and sorting
- [ ] Pagination
- [x] Accounts for everyone (JWT in an httpOnly cookie) and admin-only writes
- [ ] Ratings, reviews and a watchlist
- [x] Environment validation (Zod) and a health check
- [x] Dockerfiles for the API and the website
- [x] Tests (Vitest + Supertest) and GitHub Actions CI
- [x] Deployment (Render + Neon)
