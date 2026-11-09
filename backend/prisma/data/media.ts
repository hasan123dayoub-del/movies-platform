// Videos: official trailers (YouTube ids) and the films that are free to watch on the site.

// The HLS files live in their own repo, served by GitHub Pages:
// github.com/hasan123dayoub-del/movies-platform-media (6 qualities, 144p to 1080p)
const MEDIA = "https://hasan123dayoub-del.github.io/movies-platform-media";
const COMMONS = "https://upload.wikimedia.org/wikipedia/commons";

// Open films (Creative Commons Attribution 3.0, Blender Foundation): the whole film
// can be watched on its page. They have no cast in the catalog (animated, no actors).
export const freeFilms = [
  {
    title: "Big Buck Bunny",
    type: "Animation",
    rating: 6.4,
    director: "Sacha Goedegebure",
    releaseYear: 2008,
    description:
      "A big, gentle rabbit is bullied by three rodents until he decides to give them a taste of their own medicine. An open film by the Blender Foundation (CC BY 3.0).",
    posterUrl: `${COMMONS}/c/c5/Big_buck_bunny_poster_big.jpg`,
    streamUrl: `${MEDIA}/big-buck-bunny/master.m3u8`,
  },
  {
    title: "Caminandes 2: Gran Dillama",
    type: "Animation",
    rating: 7.0,
    director: "Pablo Vazquez",
    releaseYear: 2013,
    description:
      "Koro the llama wants the grass on the other side of an electric fence, and tries everything to get it. An open film by the Blender Foundation (CC BY 3.0).",
    posterUrl: `${MEDIA}/caminandes-2/poster.jpg`,
    streamUrl: `${MEDIA}/caminandes-2/master.m3u8`,
  },
];

// Official trailers by title. Each one was checked on YouTube: public, embeddable, and
// uploaded by the studio or network, the show's official channel, or Rotten Tomatoes'
// classic trailers channel. Titles with no trustworthy trailer are left out (the admin
// can add one from the edit form).
export const movieTrailers: Record<string, string> = {
  "Barbie": "pBk4NYhWNMM", // Warner Bros.
  "Catch Me If You Can": "71rDQ7z4eFg", // Paramount Movies
  "Dune": "n9xhJrPXop4", // Warner Bros.
  "Fight Club": "qtRKdVHc-cE", // Rotten Tomatoes Classic Trailers
  "Forrest Gump": "bLvqoHBptjg", // Paramount Movies
  "Gladiator": "P5ieIbInFpg", // Paramount Movies
  "Good Will Hunting": "ReIJ1lbL-Q8", // Miramax
  "Inception": "YoHD9XEInc0", // Rotten Tomatoes Classic Trailers
  "Interstellar": "zSWdZVtXT7E", // Warner Bros. UK & Ireland
  "Joker": "t433PEQGErc", // Warner Bros.
  "La La Land": "0pdqf4P9MB8", // Lionsgate Movies
  "Lion of the Desert": "s_lpj5k0TnU", // Trancas International Films
  "Mad Max: Fury Road": "hEJnMQG9ev8", // Warner Bros.
  "Once Upon a Time in Hollywood": "ELeMaP8EPAA", // Sony Pictures Entertainment
  "Oppenheimer": "bK6ldnjE3Y0", // Universal Pictures
  "Parasite": "isOGD_7hNIY", // NEON
  "Pulp Fiction": "tGpTpVyI_OQ", // Miramax
  "Saving Private Ryan": "9CiW_DgxCnQ", // Rotten Tomatoes Classic Trailers
  "Schindler's List": "mxphAlJID9U", // Universal Pictures
  "Shutter Island": "v8yrZSkKxTA", // Rotten Tomatoes Classic Trailers
  "Taken": "XK9zL0ze9O4", // Rotten Tomatoes Classic Trailers
  "The Dark Knight": "EXeTwQWrcwY", // Rotten Tomatoes Classic Trailers
  "The Dark Knight Rises": "g8evyE9TuYk", // Warner Bros.
  "The Departed": "iojhqm0JTW4", // Rotten Tomatoes Classic Trailers
  "The Godfather": "UaVTIH8mujA", // Paramount Pictures
  "The Martian": "ej3ioOneTy8", // 20th Century Studios
  "The Matrix": "vKQi3bBA1y8", // Rotten Tomatoes Classic Trailers
  "The Revenant": "LoebZZ8K5N0", // 20th Century Studios
  "The Shawshank Redemption": "PLl99DlL6b4", // Warner Bros. Entertainment
  "The Wolf of Wall Street": "iszwuX1AK6A", // Paramount Pictures
  "Titanic": "cIJ8ma0kKtY", // Paramount Movies
  "الرسالة": "bFBedljRGEE", // Front Row Filmed Entertainment
};

export const seriesTrailers: Record<string, string> = {
  "Breaking Bad": "VaOt6tXyf2Y", // Breaking Bad & Beyond
  "Chernobyl": "s9APLXM9Ei8", // HBO
  "Dark": "M4GIS5WoIIw", // Netflix Deutschland, Österreich und Schweiz
  "Friends": "H29XSxoKp80", // Warner Bros. Rewind
  "Game of Thrones": "KPLWWIOCOOQ", // GameofThrones
  "Money Heist": "_InqQJRqGW4", // Netflix
  "Peaky Blinders": "EM12mcTEI88", // BBC
  "Sherlock": "WbFCiYykyII", // SherlockBBC
  "Stranger Things": "b9EkMc79ZSU", // Netflix
  "الهيبة": "-ejLq_zV5iU", // MBC1
};
