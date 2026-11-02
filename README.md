# Movies Platform

A platform for movies and actors: every movie has its cast, and every actor has the role they played in each movie.

- **Backend:** Express 5 + TypeScript + Prisma 7 + PostgreSQL 17 (Docker)
- **Frontend:** Next.js (coming soon)

## Data model

```
Movie ──< MovieActor >── Actor
          (role)
```

- **Movie:** title, type, rating, director
- **Actor:** name, birthday, nationality
- **MovieActor:** links an actor to a movie with the role they played

## Run the backend locally

Requirements: Node.js 24, Docker Desktop.

```bash
cd backend
npm install
cp .env.example .env

docker compose up -d          # start PostgreSQL on port 5433
npx prisma migrate dev        # create the tables
npx prisma generate           # generate the Prisma Client
npx prisma db seed            # add sample movies and actors

npm run dev                   # http://localhost:4000
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/movies` | List all movies |
| GET | `/movies/:id` | One movie with its cast and their roles |
| POST | `/movies` | Create a movie |
| PUT | `/movies/:id` | Update a movie (any of its fields) |
| DELETE | `/movies/:id` | Delete a movie |
| POST | `/movies/:id/actors` | Add an actor to a movie with a role |
| PUT | `/movies/:id/actors/:actorId` | Change the actor's role in the movie |
| DELETE | `/movies/:id/actors/:actorId` | Remove the actor from the movie |
| GET | `/actors` | List all actors |
| GET | `/actors/:id` | One actor with their movies and roles |
| POST | `/actors` | Create an actor |
| PUT | `/actors/:id` | Update an actor (any of their fields) |
| DELETE | `/actors/:id` | Delete an actor |

### Example bodies

```jsonc
// POST /movies
{ "title": "Interstellar", "type": "Sci-Fi", "rating": 8.7, "director": "Christopher Nolan" }

// POST /actors (birthday is YYYY-MM-DD)
{ "name": "Cillian Murphy", "birthday": "1976-05-25", "nationality": "Irish" }

// POST /movies/:id/actors
{ "actorId": 6, "role": "Fischer" }
```

### Errors

Every error is returned as JSON.

| Status | When |
|---|---|
| 400 | Invalid body, invalid id in the URL, or broken JSON. The response lists each invalid field. |
| 404 | The movie, actor, cast member or route does not exist |
| 409 | The actor is already in the movie |
| 500 | Unexpected server error (details are logged on the server, never sent to the client) |

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "rating", "message": "Too big: expected number to be <=10" }]
}
```
