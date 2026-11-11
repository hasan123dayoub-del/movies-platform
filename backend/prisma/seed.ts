// Fills the database with sample data: npx prisma db seed
// The data lives in prisma/data/; this file only writes it to the database.

import { prisma } from "../src/lib/prisma.js";
import { actors, type ActorKey } from "./data/actors.js";
import { movies } from "./data/movies.js";
import { series } from "./data/series.js";
import { episodes, type EpisodeData } from "./data/episodes.js";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { reviewers, movieReviews, seriesReviews, type ReviewerKey } from "./data/reviews.js";
import { freeFilms, movieTrailers, seriesTrailers } from "./data/media.js";
import { movieRuntimes } from "./data/runtimes.js";
import { movieTmdbIds, seriesTmdbIds } from "./data/tmdb.js";

// Public demo logins (also shown in the README), so they must stay harmless
const demoAccounts = [
  { name: "Demo Admin", email: "admin@movies.dev", password: "admin1234", role: "ADMIN" },
  { name: "Demo User", email: "user@movies.dev", password: "user1234", role: "USER" },
] as const;

async function main() {
  // On the server (Render) the seed runs at every start: only fill an empty database,
  // never wipe data that is already there. Locally, `npx prisma db seed` still resets.
  if (process.env.SEED_ONLY_IF_EMPTY && (await prisma.movie.count()) > 0) {
    console.log("Database already has data, skipping the catalog.");
  } else {
    await seedCatalog();
  }
  // Added separately, so a database filled before these existed gets them too
  await seedMediaLinks();
  await seedSampleReviews();
}

// Actors, movies, series (with seasons and episodes) and the demo accounts
async function seedCatalog() {
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

// The free films and the official trailers (prisma/data/media.ts). Safe to run on every
// start: it only adds a free film that is missing and fills trailers that are empty,
// so nothing an admin changed is overwritten.
async function seedMediaLinks() {
  let added = 0;
  for (const film of freeFilms) {
    const existing = await prisma.movie.findFirst({ where: { title: film.title }, select: { id: true, streamUrl: true } });
    if (!existing) {
      await prisma.movie.create({ data: film });
      added++;
    } else if (!existing.streamUrl) {
      await prisma.movie.update({ where: { id: existing.id }, data: { streamUrl: film.streamUrl } });
    }
  }

  let trailers = 0;
  for (const [title, trailerYoutubeId] of Object.entries(movieTrailers)) {
    trailers += (await prisma.movie.updateMany({ where: { title, trailerYoutubeId: null }, data: { trailerYoutubeId } })).count;
  }
  for (const [title, trailerYoutubeId] of Object.entries(seriesTrailers)) {
    trailers += (await prisma.series.updateMany({ where: { title, trailerYoutubeId: null }, data: { trailerYoutubeId } })).count;
  }
  // Runtimes, only where a film has none yet
  let runtimes = 0;
  for (const [title, runtime] of Object.entries(movieRuntimes)) {
    runtimes += (await prisma.movie.updateMany({ where: { title, runtime: null }, data: { runtime } })).count;
  }
  // TMDB ids (for "where to watch"), only where a title has none yet
  let tmdbIds = 0;
  for (const [title, tmdbId] of Object.entries(movieTmdbIds)) {
    tmdbIds += (await prisma.movie.updateMany({ where: { title, tmdbId: null }, data: { tmdbId } })).count;
  }
  for (const [title, tmdbId] of Object.entries(seriesTmdbIds)) {
    tmdbIds += (await prisma.series.updateMany({ where: { title, tmdbId: null }, data: { tmdbId } })).count;
  }
  if (added || trailers || runtimes || tmdbIds) {
    console.log(`Added ${added} free films, ${trailers} trailers, ${runtimes} runtimes and ${tmdbIds} TMDB ids`);
  }
}

// Sample member reviews (prisma/data/reviews.ts), only while there are no reviews at all,
// so members' real reviews are never touched
async function seedSampleReviews() {
  if ((await prisma.review.count()) > 0) {
    return;
  }

  // The sample members get a random password nobody knows; the demo user keeps theirs
  const userIds = {} as Record<ReviewerKey, number>;
  for (const [key, reviewer] of Object.entries(reviewers) as [ReviewerKey, (typeof reviewers)[ReviewerKey]][]) {
    const user =
      key === "user"
        ? await prisma.user.findUnique({ where: { email: reviewer.email } })
        : await prisma.user.upsert({
            where: { email: reviewer.email },
            update: {},
            create: { ...reviewer, passwordHash: await bcrypt.hash(randomUUID(), 10) },
          });
    if (user) userIds[key] = user.id;
  }

  // Titles are matched by name; a title or reviewer that isn't there is skipped
  let count = 0;
  const add = async (target: { movieId: number } | { seriesId: number }, list: SampleReview[]) => {
    for (const [reviewer, rating, comment] of list) {
      const userId = userIds[reviewer];
      if (!userId) continue;
      await prisma.review.create({ data: { userId, rating, comment: comment ?? null, ...target } });
      count++;
    }
  };
  for (const [title, list] of Object.entries(movieReviews)) {
    const movie = await prisma.movie.findFirst({ where: { title }, select: { id: true } });
    if (movie) await add({ movieId: movie.id }, list);
  }
  for (const [title, list] of Object.entries(seriesReviews)) {
    const found = await prisma.series.findFirst({ where: { title }, select: { id: true } });
    if (found) await add({ seriesId: found.id }, list);
  }
  console.log(`Added ${count} sample reviews`);
}

type SampleReview = (typeof movieReviews)[string][number];

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
