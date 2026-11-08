// Fills the database with sample data: npx prisma db seed
// The data lives in prisma/data/; this file only writes it to the database.

import { prisma } from "../src/lib/prisma.js";
import { actors, type ActorKey } from "./data/actors.js";
import { movies } from "./data/movies.js";
import { series } from "./data/series.js";
import { episodes, type EpisodeData } from "./data/episodes.js";
import bcrypt from "bcryptjs";

// Public demo logins (also shown in the README), so they must stay harmless
const demoAccounts = [
  { name: "Demo Admin", email: "admin@movies.dev", password: "admin1234", role: "ADMIN" },
  { name: "Demo User", email: "user@movies.dev", password: "user1234", role: "USER" },
] as const;

async function main() {
  // On the server (Render) the seed runs at every start: only fill an empty database,
  // never wipe data that is already there. Locally, `npx prisma db seed` still resets.
  if (process.env.SEED_ONLY_IF_EMPTY && (await prisma.movie.count()) > 0) {
    console.log("Database already has data, skipping the seed.");
    return;
  }

  // 1. Clear old data. Deleting a series also deletes its seasons, episodes and cast
  // links, and deleting an actor deletes their cast links (onDelete: Cascade)
  await prisma.series.deleteMany();
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

  // 4. TV series, each with its seasons, their episodes, and its cast (one nested create)
  let episodeCount = 0;
  for (const { seasons, cast, ...info } of series) {
    await prisma.series.create({
      data: {
        ...info,
        seasons: {
          create: seasons.map(({ episodes: inline = [], ...season }) => {
            // The full episode list (data/episodes.ts) wins over the few written inline
            const list: EpisodeData[] = episodes[info.title]?.[season.number] ?? inline;
            episodeCount += list.length;
            return {
              ...season,
              episodes: {
                create: list.map((episode, index) => ({
                  number: index + 1,
                  title: episode.title,
                  airDate: episode.airDate ? new Date(episode.airDate) : null,
                  runtime: episode.runtime ?? null,
                  description: episode.description ?? null,
                })),
              },
            };
          }),
        },
        actors: {
          create: cast.map(([actor, role]) => ({ actorId: ids[actor], role })),
        },
      },
    });
  }

  // 5. Demo accounts, to try the site without registering.
  // Upsert (create or update), so real accounts are never deleted by the seed.
  for (const account of demoAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, role: account.role, passwordHash },
      create: { name: account.name, email: account.email, role: account.role, passwordHash },
    });
  }

  const seasonCount = series.reduce((sum, s) => sum + s.seasons.length, 0);
  console.log(
    `Seeded ${Object.keys(actors).length} actors, ${movies.length} movies and ` +
      `${series.length} series (${seasonCount} seasons, ${episodeCount} episodes)`,
  );
  for (const { email, password, role } of demoAccounts) {
    console.log(`  ${role.padEnd(5)}  ${email} / ${password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
