import { prisma } from "../src/lib/prisma.js";

async function main() {
  // 1. Clear old data (children first, then parents)
  await prisma.movieActor.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.actor.deleteMany();

  // 2. Actors
  const leo = await prisma.actor.create({
    data: { name: "Leonardo DiCaprio", birthday: new Date("1974-11-11"), nationality: "American" },
  });
  const kate = await prisma.actor.create({
    data: { name: "Kate Winslet", birthday: new Date("1975-10-05"), nationality: "British" },
  });
  const tom = await prisma.actor.create({
    data: { name: "Tom Hardy", birthday: new Date("1977-09-15"), nationality: "British" },
  });
  const joseph = await prisma.actor.create({
    data: { name: "Joseph Gordon-Levitt", birthday: new Date("1981-02-17"), nationality: "American" },
  });
  const margot = await prisma.actor.create({
    data: { name: "Margot Robbie", birthday: new Date("1990-07-02"), nationality: "Australian" },
  });

  // 3. Movies, each with its actors and their roles
  await prisma.movie.create({
    data: {
      title: "Titanic",
      type: "Romance",
      rating: 7.9,
      director: "James Cameron",
      posterUrl: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
      actors: {
        create: [
          { actorId: leo.id, role: "Jack Dawson" },
          { actorId: kate.id, role: "Rose DeWitt Bukater" },
        ],
      },
    },
  });

  await prisma.movie.create({
    data: {
      title: "Inception",
      type: "Sci-Fi",
      rating: 8.8,
      director: "Christopher Nolan",
      posterUrl: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
      actors: {
        create: [
          { actorId: leo.id, role: "Cobb" },
          { actorId: joseph.id, role: "Arthur" },
          { actorId: tom.id, role: "Eames" },
        ],
      },
    },
  });

  await prisma.movie.create({
    data: {
      title: "The Revenant",
      type: "Adventure",
      rating: 8.0,
      director: "Alejandro G. Inarritu",
      posterUrl: "https://image.tmdb.org/t/p/w500/tSaBkriE7TpbjFoQUFXuikoz0dF.jpg",
      actors: {
        create: [
          { actorId: leo.id, role: "Hugh Glass" },
          { actorId: tom.id, role: "John Fitzgerald" },
        ],
      },
    },
  });

  await prisma.movie.create({
    data: {
      title: "The Wolf of Wall Street",
      type: "Comedy",
      rating: 8.2,
      director: "Martin Scorsese",
      posterUrl: "https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg",
      actors: {
        create: [
          { actorId: leo.id, role: "Jordan Belfort" },
          { actorId: margot.id, role: "Naomi Lapaglia" },
        ],
      },
    },
  });

  console.log("Seeding finished");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
