import type { ActorKey } from "./actors.js";

const TMDB = "https://image.tmdb.org/t/p/w500";
const WIKI = "https://upload.wikimedia.org/wikipedia/en";

// Movies, each with its cast: [actor, role]
export const movies: {
  title: string;
  type: string;
  rating: number;
  director: string;
  posterUrl: string;
  cast: [ActorKey, string][];
}[] = [
  {
    title: "Titanic", type: "Romance", rating: 7.9, director: "James Cameron",
    posterUrl: `${TMDB}/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg`,
    cast: [["leo", "Jack Dawson"], ["kate", "Rose DeWitt Bukater"]],
  },
  {
    title: "Inception", type: "Sci-Fi", rating: 8.8, director: "Christopher Nolan",
    posterUrl: `${TMDB}/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg`,
    cast: [["leo", "Cobb"], ["joseph", "Arthur"], ["tom", "Eames"], ["cillian", "Robert Fischer"]],
  },
  {
    title: "The Revenant", type: "Adventure", rating: 8.0, director: "Alejandro G. Inarritu",
    posterUrl: `${TMDB}/tSaBkriE7TpbjFoQUFXuikoz0dF.jpg`,
    cast: [["leo", "Hugh Glass"], ["tom", "John Fitzgerald"]],
  },
  {
    title: "The Wolf of Wall Street", type: "Comedy", rating: 8.2, director: "Martin Scorsese",
    posterUrl: `${TMDB}/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg`,
    cast: [["leo", "Jordan Belfort"], ["margot", "Naomi Lapaglia"], ["matthew", "Mark Hanna"]],
  },
  {
    title: "Interstellar", type: "Sci-Fi", rating: 8.7, director: "Christopher Nolan",
    posterUrl: `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
    cast: [["matthew", "Cooper"], ["anne", "Brand"], ["jessica", "Murph"], ["matt", "Dr. Mann"]],
  },
  {
    title: "The Dark Knight Rises", type: "Action", rating: 8.4, director: "Christopher Nolan",
    posterUrl: `${WIKI}/8/83/Dark_knight_rises_poster.jpg`,
    cast: [["christian", "Bruce Wayne"], ["tom", "Bane"], ["anne", "Selina Kyle"], ["joseph", "John Blake"], ["cillian", "Jonathan Crane"], ["liam", "Ra's al Ghul"]],
  },
  {
    title: "Oppenheimer", type: "Drama", rating: 8.3, director: "Christopher Nolan",
    posterUrl: `${WIKI}/4/4a/Oppenheimer_%28film%29.jpg`,
    cast: [["cillian", "J. Robert Oppenheimer"], ["emily", "Kitty Oppenheimer"], ["matt", "Leslie Groves"]],
  },
  {
    title: "Barbie", type: "Comedy", rating: 6.8, director: "Greta Gerwig",
    posterUrl: `${WIKI}/0/0b/Barbie_2023_poster.jpg`,
    cast: [["margot", "Barbie"], ["ryan", "Ken"]],
  },
  {
    title: "Mad Max: Fury Road", type: "Action", rating: 8.1, director: "George Miller",
    posterUrl: `${WIKI}/6/6e/Mad_Max_Fury_Road.jpg`,
    cast: [["tom", "Max Rockatansky"], ["charlize", "Imperator Furiosa"]],
  },
  {
    title: "The Departed", type: "Crime", rating: 8.5, director: "Martin Scorsese",
    posterUrl: `${WIKI}/5/50/Departed234.jpg`,
    cast: [["leo", "Billy Costigan"], ["matt", "Colin Sullivan"], ["jack", "Frank Costello"]],
  },
  {
    title: "Shutter Island", type: "Thriller", rating: 8.2, director: "Martin Scorsese",
    posterUrl: `${WIKI}/7/76/Shutterislandposter.jpg`,
    cast: [["leo", "Teddy Daniels"], ["mark", "Chuck Aule"]],
  },
  {
    title: "La La Land", type: "Musical", rating: 8.0, director: "Damien Chazelle",
    posterUrl: `${WIKI}/a/ab/La_La_Land_%28film%29.png`,
    cast: [["ryan", "Sebastian"], ["emma", "Mia"]],
  },
  {
    title: "The Martian", type: "Sci-Fi", rating: 8.0, director: "Ridley Scott",
    posterUrl: `${WIKI}/c/cd/The_Martian_film_poster.jpg`,
    cast: [["matt", "Mark Watney"], ["jessica", "Melissa Lewis"]],
  },
  {
    title: "Once Upon a Time in Hollywood", type: "Comedy", rating: 7.6, director: "Quentin Tarantino",
    posterUrl: `${WIKI}/a/a6/Once_Upon_a_Time_in_Hollywood_poster.png`,
    cast: [["leo", "Rick Dalton"], ["brad", "Cliff Booth"], ["margot", "Sharon Tate"]],
  },
  {
    title: "Taken", type: "Thriller", rating: 7.8, director: "Pierre Morel",
    posterUrl: `${WIKI}/e/ed/Taken_film_poster.jpg`,
    cast: [["liam", "Bryan Mills"], ["maggie", "Kim Mills"]],
  },
  {
    title: "Schindler's List", type: "Drama", rating: 9.0, director: "Steven Spielberg",
    posterUrl: `${WIKI}/3/38/Schindler%27s_List_movie.jpg`,
    cast: [["liam", "Oskar Schindler"], ["ben", "Itzhak Stern"], ["ralph", "Amon Göth"]],
  },
];
