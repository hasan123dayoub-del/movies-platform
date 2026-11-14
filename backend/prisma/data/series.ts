import type { ActorKey } from "./actors.js";

// Posters come from Wikipedia (season DVD covers / official posters).
// Peaky Blinders and Sherlock have no poster there, so they show the colored placeholder.
const WIKI = "https://upload.wikimedia.org/wikipedia/en";
const WIKI_AR = "https://upload.wikimedia.org/wikipedia/ar";

type SeasonData = {
  number: number;
  title?: string;
  releaseYear: number;
  posterUrl?: string;
  // Only episodes we are sure about; a season without them can be filled in from the admin
  episodes?: { title: string; airDate?: string }[];
};

export type SeriesData = {
  title: string;
  type: string;
  rating: number;
  creator: string;
  startYear: number;
  endYear: number | null;
  description: string;
  posterUrl: string | null;
  seasons: SeasonData[];
  cast: [ActorKey, string][];
};

// Season DVD covers, in season order
const FRIENDS_POSTERS = [
  `${WIKI}/1/1c/Friends_Season_1_DVD.jpg`,
  `${WIKI}/a/a2/Friends_Season_2_DVD.jpg`,
  `${WIKI}/2/22/Friends_Season_3_DVD.jpg`,
  `${WIKI}/a/a6/Friends_Season_4_DVD.jpg`,
  `${WIKI}/f/fb/Friends_Season_5_DVD.jpg`,
  `${WIKI}/b/b4/Friends_Season_6_DVD.jpg`,
  `${WIKI}/a/ab/Friends_Season_7_DVD.jpg`,
  `${WIKI}/e/ec/Friends_Season_8_DVD.jpg`,
  `${WIKI}/3/33/Friends_Season_9_DVD.jpg`,
  `${WIKI}/2/20/Friends_Season_10_DVD.jpg`,
];
const OFFICE_POSTERS = [
  `${WIKI}/9/96/Office_Season_2.jpg`,
  `${WIKI}/2/24/TheOfficeUSSeason3Cover.jpg`,
  `${WIKI}/7/7e/The_Office_Season_Four_DVD_Cover.jpg`,
  `${WIKI}/5/58/Office_S5_DVD.JPG`,
  `${WIKI}/a/a5/TheOffice_S6_DVD.jpg`,
  `${WIKI}/5/58/TheOffice_S7_DVD.jpg`,
  `${WIKI}/a/ae/The_Office_Season_8.jpg`,
  `${WIKI}/3/32/The_Office_S9_DVD.jpg`,
]; // seasons 2-9

// Numbered episodes with no title of their own (e.g. Peaky Blinders series 1)
const numbered = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ title: `Episode ${i + 1}` }));

export const series: SeriesData[] = [
  {
    title: "Breaking Bad", type: "Crime", rating: 9.5, creator: "Vince Gilligan",
    startYear: 2008, endYear: 2013,
    description: "A high-school chemistry teacher facing a terminal diagnosis turns to making methamphetamine to secure his family's future, and slowly becomes a feared drug lord.",
    posterUrl: `${WIKI}/6/61/BreakingBadS1DVD.jpg`,
    seasons: [
      {
        number: 1, releaseYear: 2008, posterUrl: `${WIKI}/6/61/BreakingBadS1DVD.jpg`,
        episodes: [
          { title: "Pilot" },
          { title: "Cat's in the Bag..." },
          { title: "...And the Bag's in the River" },
          { title: "Cancer Man" },
          { title: "Gray Matter" },
          { title: "Crazy Handful of Nothin'" },
          { title: "A No-Rough-Stuff-Type Deal" },
        ],
      },
      { number: 2, releaseYear: 2009, posterUrl: `${WIKI}/e/e0/BreakingBadS2DVD.jpg` },
      { number: 3, releaseYear: 2010, posterUrl: `${WIKI}/8/87/Breaking_Bad_season_3_DVD.png` },
      { number: 4, releaseYear: 2011, posterUrl: `${WIKI}/d/d9/Breaking_Bad_season_4_DVD.png` },
      { number: 5, releaseYear: 2012, posterUrl: `${WIKI}/8/8b/Breaking_Bad_season_five_part_i_and_ii_dvd.png` },
    ],
    cast: [["bryan", "Walter White"], ["aaron", "Jesse Pinkman"], ["anna", "Skyler White"]],
  },
  {
    title: "Stranger Things", type: "Sci-Fi", rating: 8.7, creator: "The Duffer Brothers",
    startYear: 2016, endYear: 2025,
    description: "When a boy vanishes in a small Indiana town in the 1980s, his friends, family and the police uncover secret experiments, a strange girl and a terrifying world beneath their own.",
    posterUrl: `${WIKI}/b/b1/Stranger_Things_season_1.jpg`,
    seasons: [
      {
        number: 1, releaseYear: 2016, posterUrl: `${WIKI}/b/b1/Stranger_Things_season_1.jpg`,
        episodes: [
          { title: "Chapter One: The Vanishing of Will Byers" },
          { title: "Chapter Two: The Weirdo on Maple Street" },
          { title: "Chapter Three: Holly, Jolly" },
          { title: "Chapter Four: The Body" },
          { title: "Chapter Five: The Flea and the Acrobat" },
          { title: "Chapter Six: The Monster" },
          { title: "Chapter Seven: The Bathtub" },
          { title: "Chapter Eight: The Upside Down" },
        ],
      },
      { number: 2, releaseYear: 2017, posterUrl: `${WIKI}/f/f7/Stranger_Things_season_2.jpg` },
      { number: 3, releaseYear: 2019, posterUrl: `${WIKI}/d/d4/Stranger_Things_season_3.png` },
      { number: 4, releaseYear: 2022, posterUrl: `${WIKI}/7/78/Stranger_Things_season_4.jpg` },
      { number: 5, releaseYear: 2025, posterUrl: `${WIKI}/b/be/Stranger_Things_season_5.jpeg` },
    ],
    cast: [["millie", "Eleven"], ["winona", "Joyce Byers"], ["harbour", "Jim Hopper"]],
  },
  {
    title: "Peaky Blinders", type: "Crime", rating: 8.8, creator: "Steven Knight",
    startYear: 2013, endYear: 2022,
    description: "In Birmingham after the First World War, the ambitious Shelby family and their razor-capped gang fight to grow their empire against rivals, the police and their own demons.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/b/bc/Peaky_Blinders_1_Poster.jpg",
    seasons: [
      // Series 1's episodes have no titles of their own, only numbers
      { number: 1, releaseYear: 2013, posterUrl: "https://upload.wikimedia.org/wikipedia/ar/b/bc/Peaky_Blinders_1_Poster.jpg", episodes: numbered(6) },
      { number: 2, releaseYear: 2014 },
      { number: 3, releaseYear: 2016 },
      { number: 4, releaseYear: 2017 },
      { number: 5, releaseYear: 2019 },
      { number: 6, releaseYear: 2022 },
    ],
    cast: [["cillian", "Thomas Shelby"], ["helen", "Polly Gray"], ["tom", "Alfie Solomons"]],
  },
  {
    title: "Chernobyl", type: "Drama", rating: 9.3, creator: "Craig Mazin",
    startYear: 2019, endYear: 2019,
    description: "The true story of the 1986 nuclear disaster in Soviet Ukraine, and of the people who risked everything to contain it and to uncover the truth behind it.",
    posterUrl: `${WIKI}/a/a7/Chernobyl_2019_Miniseries.jpg`,
    seasons: [
      {
        number: 1, title: "Miniseries", releaseYear: 2019,
        episodes: [
          { title: "1:23:45", airDate: "2019-05-06" },
          { title: "Please Remain Calm", airDate: "2019-05-13" },
          { title: "Open Wide, O Earth", airDate: "2019-05-20" },
          { title: "The Happiness of All Mankind", airDate: "2019-05-27" },
          { title: "Vichnaya Pamyat", airDate: "2019-06-03" },
        ],
      },
    ],
    cast: [["jared", "Valery Legasov"], ["stellan", "Boris Shcherbina"], ["emilyWatson", "Ulana Khomyuk"]],
  },
  {
    title: "Sherlock", type: "Crime", rating: 9.1, creator: "Mark Gatiss and Steven Moffat",
    startYear: 2010, endYear: 2017,
    description: "Sherlock Holmes and Dr John Watson solve crimes in modern-day London: a brilliant, difficult detective and the army doctor who becomes his friend.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/4/4d/Sherlock_titlecard.jpg",
    seasons: [
      { number: 1, releaseYear: 2010, episodes: [{ title: "A Study in Pink" }, { title: "The Blind Banker" }, { title: "The Great Game" }] },
      { number: 2, releaseYear: 2012, episodes: [{ title: "A Scandal in Belgravia" }, { title: "The Hounds of Baskerville" }, { title: "The Reichenbach Fall" }] },
      { number: 3, releaseYear: 2014, episodes: [{ title: "The Empty Hearse" }, { title: "The Sign of Three" }, { title: "His Last Vow" }] },
      { number: 4, releaseYear: 2017, episodes: [{ title: "The Six Thatchers" }, { title: "The Lying Detective" }, { title: "The Final Problem" }] },
    ],
    cast: [["benedict", "Sherlock Holmes"], ["martin", "Dr John Watson"]],
  },
  {
    title: "Game of Thrones", type: "Fantasy", rating: 9.2, creator: "David Benioff and D. B. Weiss",
    startYear: 2011, endYear: 2019,
    description: "Noble families fight for the Iron Throne of the Seven Kingdoms, while an exiled princess raises dragons and an ancient enemy wakes beyond the Wall.",
    posterUrl: `${WIKI}/e/e8/Game_of_Thrones_Season_1.jpg`,
    seasons: [
      {
        number: 1, releaseYear: 2011, posterUrl: `${WIKI}/e/e8/Game_of_Thrones_Season_1.jpg`,
        episodes: [
          { title: "Winter Is Coming" },
          { title: "The Kingsroad" },
          { title: "Lord Snow" },
          { title: "Cripples, Bastards, and Broken Things" },
          { title: "The Wolf and the Lion" },
          { title: "A Golden Crown" },
          { title: "You Win or You Die" },
          { title: "The Pointy End" },
          { title: "Baelor" },
          { title: "Fire and Blood" },
        ],
      },
      { number: 2, releaseYear: 2012, posterUrl: `${WIKI}/c/c2/Game_of_Thrones_Season_2.jpg` },
      { number: 3, releaseYear: 2013, posterUrl: `${WIKI}/1/1d/Game_of_Thrones_Season_3.jpg` },
      { number: 4, releaseYear: 2014, posterUrl: `${WIKI}/8/80/Game_of_Thrones_Season_4.jpg` },
      { number: 5, releaseYear: 2015, posterUrl: `${WIKI}/5/59/Game_of_Thrones_Season_5.png` },
      { number: 6, releaseYear: 2016, posterUrl: `${WIKI}/d/d1/Game_of_Thrones_Season_6.jpeg` },
      { number: 7, releaseYear: 2017, posterUrl: `${WIKI}/9/92/Game_of_Thrones_Season_7.png` },
      { number: 8, releaseYear: 2019, posterUrl: `${WIKI}/e/e0/Game_of_Thrones_Season_8.png` },
    ],
    cast: [["emilia", "Daenerys Targaryen"], ["kit", "Jon Snow"], ["dinklage", "Tyrion Lannister"]],
  },
  {
    title: "Friends", type: "Comedy", rating: 8.9, creator: "David Crane and Marta Kauffman",
    startYear: 1994, endYear: 2004,
    description: "Six friends in their twenties share apartments, jobs, break-ups and endless coffee at Central Perk in New York City.",
    posterUrl: `${WIKI}/1/1c/Friends_Season_1_DVD.jpg`,
    // Each season started in September, so its year is the year it began
    seasons: [1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003].map((year, i) => ({
      number: i + 1,
      releaseYear: year,
      posterUrl: FRIENDS_POSTERS[i]!,
    })),
    cast: [["aniston", "Rachel Green"], ["perry", "Chandler Bing"], ["leblanc", "Joey Tribbiani"]],
  },
  {
    title: "The Office", type: "Comedy", rating: 9.0, creator: "Greg Daniels",
    startYear: 2005, endYear: 2013,
    description: "A camera crew follows the everyday lives of the employees at the Scranton branch of a paper company, and their very awkward boss.",
    posterUrl: `${WIKI}/b/b6/TheOfficeUSSeason1Cover.jpg`,
    seasons: [
      {
        number: 1, releaseYear: 2005, posterUrl: `${WIKI}/b/b6/TheOfficeUSSeason1Cover.jpg`,
        episodes: [
          { title: "Pilot" },
          { title: "Diversity Day" },
          { title: "Health Care" },
          { title: "The Alliance" },
          { title: "Basketball" },
          { title: "Hot Girl" },
        ],
      },
      // Season 2 started the same year, in September 2005
      ...[2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012].map((year, i) => ({
        number: i + 2,
        releaseYear: year,
        posterUrl: OFFICE_POSTERS[i]!,
      })),
    ],
    cast: [["carell", "Michael Scott"], ["krasinski", "Jim Halpert"]],
  },
  {
    title: "Dark", type: "Sci-Fi", rating: 8.7, creator: "Baran bo Odar and Jantje Friese",
    startYear: 2017, endYear: 2020,
    description: "When two children go missing in a small German town, four families uncover a time-travel mystery that spans several generations.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/8/80/Dark_poster.jpg",
    seasons: [
      { number: 1, releaseYear: 2017 },
      { number: 2, releaseYear: 2019 },
      { number: 3, releaseYear: 2020 },
    ],
    cast: [["louis", "Jonas Kahnwald"]],
  },
  {
    title: "Money Heist", type: "Crime", rating: 8.2, creator: "Álex Pina",
    startYear: 2017, endYear: 2021,
    description: "A mysterious mastermind known as the Professor gathers eight robbers with city code names to pull off the biggest heist in Spain's history.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/b/b7/%D9%85%D9%84%D8%B5%D9%82_%D8%A8%D9%8A%D8%AA_%D8%A7%D9%84%D9%85%D8%A7%D9%84.jpg",
    // The show calls its seasons "parts"
    seasons: [
      { number: 1, title: "Part 1", releaseYear: 2017 },
      { number: 2, title: "Part 2", releaseYear: 2017 },
      { number: 3, title: "Part 3", releaseYear: 2019 },
      { number: 4, title: "Part 4", releaseYear: 2020 },
      { number: 5, title: "Part 5", releaseYear: 2021 },
    ],
    cast: [["ursula", "Tokyo"], ["alvaro", "The Professor"]],
  },

  // ---------- Arabic series: every detail in Arabic, except the summary (in English
  // here, like every title; its Arabic is in descriptions.ts) ----------
  {
    title: "الهيبة", type: "أكشن", rating: 7.1, creator: "سامر البرقاوي",
    startYear: 2017, endYear: 2021,
    description: "Jabal Sheikh al-Jabal, head of a powerful family in the village of Al Hayba on the Lebanese–Syrian border, rules through loyalty and fear, while family feuds and enemies test his grip every day.",
    posterUrl: `${WIKI_AR}/b/ba/AlHayba_Poster.jpg`,
    // لكل جزء من الهيبة اسمه الخاص
    seasons: [
      { number: 1, title: "الهيبة", releaseYear: 2017, posterUrl: "https://upload.wikimedia.org/wikipedia/ar/b/ba/AlHayba_Poster.jpg" },
      { number: 2, title: "العودة", releaseYear: 2018, posterUrl: "https://upload.wikimedia.org/wikipedia/ar/e/e1/%D8%BA%D9%84%D8%A7%D9%81_%D9%85%D8%B3%D9%84%D8%B3%D9%84_%D8%A7%D9%84%D9%87%D9%8A%D8%A8%D8%A9_%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9.jpeg" },
      { number: 3, title: "الحصاد", releaseYear: 2019, posterUrl: "https://upload.wikimedia.org/wikipedia/ar/1/11/AlHayba_the_Harvest_Poster.jpg" },
      { number: 4, title: "الرد", releaseYear: 2020, posterUrl: "https://upload.wikimedia.org/wikipedia/ar/3/37/Al-Hayba_Al-Rad_Poster.jpg" },
      { number: 5, title: "جبل", releaseYear: 2021, posterUrl: "https://upload.wikimedia.org/wikipedia/ar/d/d8/%D8%A7%D9%84%D9%87%D9%8A%D8%A8%D8%A9_%D8%AC%D8%A8%D9%84.jpg" },
    ],
    cast: [["taim", "جبل شيخ الجبل"], ["nadine", "عليا"]],
  },
  {
    title: "ضيعة ضايعة", type: "كوميديا", rating: 9.2, creator: "الليث حجو",
    startYear: 2008, endYear: 2010,
    description: "Everyday life in Umm al-Tanafes, a small forgotten village on the Syrian coast, through the adventures of its simple, stubborn and kind-hearted people.",
    posterUrl: `${WIKI_AR}/b/b5/%D9%84%D9%82%D8%B7%D8%A9_%D8%B4%D8%A7%D8%B1%D8%A9_%D9%85%D8%B3%D9%84%D8%B3%D9%84_%D8%B6%D9%8A%D8%B9%D8%A9_%D8%B6%D8%A7%D9%8A%D8%B9%D8%A9.jpeg`,
    seasons: [
      { number: 1, releaseYear: 2008 },
      { number: 2, releaseYear: 2010 },
    ],
    cast: [["bassem", "جودة أبو خميس"], ["nidal", "أسعد خرشوف"]],
  },
  {
    title: "الزير سالم", type: "تاريخي", rating: 9.0, creator: "حاتم علي",
    startYear: 2000, endYear: 2000,
    description: "The epic of al-Muhalhel, the Arab poet and knight whose revenge for his brother Kulayb started the War of Basus, which lasted forty years.",
    posterUrl: `${WIKI_AR}/1/14/Zeer_salim_series.jpg`,
    seasons: [{ number: 1, releaseYear: 2000 }],
    cast: [["salloum", "الزير سالم"], ["abed", "جساس بن مرة"]],
  },
  {
    title: "صلاح الدين الأيوبي", type: "تاريخي", rating: 8.6, creator: "حاتم علي",
    startYear: 2001, endYear: 2001,
    description: "The life of Saladin, from his youth to uniting Egypt and the Levant and freeing Jerusalem, and his long struggle with the Crusaders.",
    posterUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Saladin_Damascus.jpg?width=500",
    seasons: [{ number: 1, releaseYear: 2001 }],
    cast: [["jamal", "صلاح الدين الأيوبي"]],
  },
  {
    title: "ربيع قرطبة", type: "تاريخي", rating: 8.7, creator: "حاتم علي",
    startYear: 2003, endYear: 2003,
    description: "The rise of Muhammad ibn Abi Amir from a poor student in Córdoba to the real ruler of al-Andalus, later known as al-Mansur.",
    posterUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Interior_Mezquita_Cordoba_Spain.jpg?width=500",
    seasons: [{ number: 1, releaseYear: 2003 }],
    cast: [["taim", "محمد بن أبي عامر"]],
  },
  {
    title: "التغريبة الفلسطينية", type: "دراما", rating: 9.4, creator: "حاتم علي",
    startYear: 2004, endYear: 2004,
    description: "The story of a simple Palestinian family from the 1930s until after the 1948 Nakba, when they were driven from their village to the refugee camps.",
    posterUrl: `${WIKI_AR}/e/e4/Tagreebeh_series_poster.jpg`,
    seasons: [{ number: 1, releaseYear: 2004 }],
    cast: [],
  },
];
