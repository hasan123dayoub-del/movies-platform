// Fills the database with sample data: npx prisma db seed
// The data lives in prisma/data/; this file only writes it to the database.

import { prisma } from "../src/lib/prisma.js";
import { actors, type ActorKey } from "./data/actors.js";
import { movies } from "./data/movies.js";

async function main() {
  // 1. Clear old data (children first, then parents)
  await prisma.movieActor.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.actor.deleteMany();

  // 2. Actors: remember each new id under its short name
  const ids = {} as Record<ActorKey, number>;
  for (const [key, actor] of Object.entries(actors) as [ActorKey, (typeof actors)[ActorKey]][]) {
    const created = await prisma.actor.create({
      data: { ...actor, birthday: new Date(actor.birthday) },
    });
    ids[key] = created.id;
  }

  // 3. Movies, each with its actors and their roles
  for (const { cast, ...movie } of movies) {
    await prisma.movie.create({
      data: {
        ...movie,
        actors: {
          create: cast.map(([actor, role]) => ({ actorId: ids[actor], role })),
        },
      },
    });
  }

  console.log(`Seeded ${Object.keys(actors).length} actors and ${movies.length} movies`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
