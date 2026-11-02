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
