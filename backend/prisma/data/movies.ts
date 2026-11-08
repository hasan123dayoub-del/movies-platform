import type { ActorKey } from "./actors.js";

const TMDB = "https://image.tmdb.org/t/p/w500";
const WIKI = "https://upload.wikimedia.org/wikipedia/en";

// Movies, each with its cast: [actor, role]
export const movies: {
  title: string;
  type: string;
  rating: number;
  director: string;
  releaseYear: number;
  description: string;
  posterUrl: string;
  cast: [ActorKey, string][];
}[] = [
  {
    title: "Titanic", type: "Romance", rating: 7.9, director: "James Cameron",
    releaseYear: 1997,
    description: "A penniless artist and a young woman engaged to a wealthy man fall in love aboard the doomed ship on its maiden voyage.",
    posterUrl: `${TMDB}/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg`,
    cast: [["leo", "Jack Dawson"], ["kate", "Rose DeWitt Bukater"]],
  },
  {
    title: "Inception", type: "Sci-Fi", rating: 8.8, director: "Christopher Nolan",
    releaseYear: 2010,
    description: "A thief who steals secrets from people's dreams is offered a chance at freedom if he can plant an idea instead.",
    posterUrl: `${TMDB}/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg`,
    cast: [["leo", "Cobb"], ["joseph", "Arthur"], ["tom", "Eames"], ["cillian", "Robert Fischer"]],
  },
  {
    title: "The Revenant", type: "Adventure", rating: 8.0, director: "Alejandro G. Inarritu",
    releaseYear: 2015,
    description: "Left for dead after a bear attack, a frontiersman crosses the frozen wilderness to find the man who betrayed him.",
    posterUrl: `${TMDB}/tSaBkriE7TpbjFoQUFXuikoz0dF.jpg`,
    cast: [["leo", "Hugh Glass"], ["tom", "John Fitzgerald"]],
  },
  {
    title: "The Wolf of Wall Street", type: "Comedy", rating: 8.2, director: "Martin Scorsese",
    releaseYear: 2013,
    description: "The rise and fall of a stockbroker whose firm grew rich on fraud, excess and corruption in 1990s New York.",
    posterUrl: `${TMDB}/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg`,
    cast: [["leo", "Jordan Belfort"], ["margot", "Naomi Lapaglia"], ["matthew", "Mark Hanna"]],
  },
  {
    title: "Interstellar", type: "Sci-Fi", rating: 8.7, director: "Christopher Nolan",
    releaseYear: 2014,
    description: "With Earth dying, a former pilot leads a team through a wormhole to search for a new home for humanity.",
    posterUrl: `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
    cast: [["matthew", "Cooper"], ["anne", "Brand"], ["jessica", "Murph"], ["matt", "Dr. Mann"]],
  },
  {
    title: "The Dark Knight Rises", type: "Action", rating: 8.4, director: "Christopher Nolan",
    releaseYear: 2012,
    description: "Eight years after he vanished, Batman returns to defend Gotham from a ruthless masked revolutionary.",
    posterUrl: `${WIKI}/8/83/Dark_knight_rises_poster.jpg`,
    cast: [["christian", "Bruce Wayne"], ["tom", "Bane"], ["anne", "Selina Kyle"], ["joseph", "John Blake"], ["cillian", "Jonathan Crane"], ["liam", "Ra's al Ghul"]],
  },
  {
    title: "Oppenheimer", type: "Drama", rating: 8.3, director: "Christopher Nolan",
    releaseYear: 2023,
    description: "The physicist who led the Manhattan Project faces the weight of creating the atomic bomb.",
    posterUrl: `${WIKI}/4/4a/Oppenheimer_%28film%29.jpg`,
    cast: [["cillian", "J. Robert Oppenheimer"], ["emily", "Kitty Oppenheimer"], ["matt", "Leslie Groves"]],
  },
  {
    title: "Barbie", type: "Comedy", rating: 6.8, director: "Greta Gerwig",
    releaseYear: 2023,
    description: "Barbie leaves her perfect plastic world for the real one and discovers what it means to be human.",
    posterUrl: `${WIKI}/0/0b/Barbie_2023_poster.jpg`,
    cast: [["margot", "Barbie"], ["ryan", "Ken"]],
  },
  {
    title: "Mad Max: Fury Road", type: "Action", rating: 8.1, director: "George Miller",
    releaseYear: 2015,
    description: "In a desert wasteland, a drifter and a rebel commander flee a tyrant in a high-speed chase across the sand.",
    posterUrl: `${WIKI}/6/6e/Mad_Max_Fury_Road.jpg`,
    cast: [["tom", "Max Rockatansky"], ["charlize", "Imperator Furiosa"]],
  },
  {
    title: "The Departed", type: "Crime", rating: 8.5, director: "Martin Scorsese",
    releaseYear: 2006,
    description: "An undercover cop inside the Boston mob and a mole inside the police race to expose each other.",
    posterUrl: `${WIKI}/5/50/Departed234.jpg`,
    cast: [["leo", "Billy Costigan"], ["matt", "Colin Sullivan"], ["jack", "Frank Costello"]],
  },
  {
    title: "Shutter Island", type: "Thriller", rating: 8.2, director: "Martin Scorsese",
    releaseYear: 2010,
    description: "Two U.S. marshals investigate a patient's escape from a hospital for the criminally insane on a remote island.",
    posterUrl: `${WIKI}/7/76/Shutterislandposter.jpg`,
    cast: [["leo", "Teddy Daniels"], ["mark", "Chuck Aule"]],
  },
  {
    title: "La La Land", type: "Musical", rating: 8.0, director: "Damien Chazelle",
    releaseYear: 2016,
    description: "A jazz pianist and an aspiring actress fall in love in Los Angeles while chasing their dreams.",
    posterUrl: `${WIKI}/a/ab/La_La_Land_%28film%29.png`,
    cast: [["ryan", "Sebastian"], ["emma", "Mia"]],
  },
  {
    title: "The Martian", type: "Sci-Fi", rating: 8.0, director: "Ridley Scott",
    releaseYear: 2015,
    description: "Stranded alone on Mars, an astronaut uses science and grit to survive until he can be rescued.",
    posterUrl: `${WIKI}/c/cd/The_Martian_film_poster.jpg`,
    cast: [["matt", "Mark Watney"], ["jessica", "Melissa Lewis"]],
  },
  {
    title: "Once Upon a Time in Hollywood", type: "Comedy", rating: 7.6, director: "Quentin Tarantino",
    releaseYear: 2019,
    description: "A fading TV actor and his stunt double look for their place in the changing Hollywood of 1969.",
    posterUrl: `${WIKI}/a/a6/Once_Upon_a_Time_in_Hollywood_poster.png`,
    cast: [["leo", "Rick Dalton"], ["brad", "Cliff Booth"], ["margot", "Sharon Tate"]],
  },
  {
    title: "Taken", type: "Thriller", rating: 7.8, director: "Pierre Morel",
    releaseYear: 2008,
    description: "A retired agent uses his particular set of skills to track down the men who kidnapped his daughter in Paris.",
    posterUrl: `${WIKI}/e/ed/Taken_film_poster.jpg`,
    cast: [["liam", "Bryan Mills"], ["maggie", "Kim Mills"]],
  },
  {
    title: "Schindler's List", type: "Drama", rating: 9.0, director: "Steven Spielberg",
    releaseYear: 1993,
    description: "A German businessman saves more than a thousand Jewish refugees by employing them in his factories during the Holocaust.",
    posterUrl: `${WIKI}/3/38/Schindler%27s_List_movie.jpg`,
    cast: [["liam", "Oskar Schindler"], ["ben", "Itzhak Stern"], ["ralph", "Amon Göth"]],
  },
  {
    title: "The Godfather", type: "Crime", rating: 9.2, director: "Francis Ford Coppola",
    releaseYear: 1972,
    description: "The ageing head of a New York crime family hands his empire to his reluctant youngest son, who is drawn into a world of loyalty, power and violence.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg",
    cast: [["marlon", "Vito Corleone"], ["pacino", "Michael Corleone"]],
  },
  {
    title: "The Shawshank Redemption", type: "Drama", rating: 9.3, director: "Frank Darabont",
    releaseYear: 1994,
    description: "A banker sentenced to life for a murder he didn't commit finds friendship and quiet hope inside Shawshank prison over two decades.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg",
    cast: [["robbins", "Andy Dufresne"], ["freeman", "Ellis \"Red\" Redding"]],
  },
  {
    title: "Pulp Fiction", type: "Crime", rating: 8.9, director: "Quentin Tarantino",
    releaseYear: 1994,
    description: "The lives of two hitmen, a boxer, a gangster's wife and a pair of robbers cross in a series of darkly funny stories in Los Angeles.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg",
    cast: [["travolta", "Vincent Vega"], ["samuel", "Jules Winnfield"], ["uma", "Mia Wallace"]],
  },
  {
    title: "Fight Club", type: "Drama", rating: 8.8, director: "David Fincher",
    releaseYear: 1999,
    description: "A tired office worker and a reckless soap seller start an underground fight club that grows into something far more dangerous.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg",
    cast: [["norton", "The Narrator"], ["brad", "Tyler Durden"]],
  },
  {
    title: "Forrest Gump", type: "Drama", rating: 8.8, director: "Robert Zemeckis",
    releaseYear: 1994,
    description: "A kind man with a simple view of life finds himself at the heart of decades of American history while never forgetting his childhood love.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg",
    cast: [["hanks", "Forrest Gump"]],
  },
  {
    title: "The Matrix", type: "Sci-Fi", rating: 8.7, director: "The Wachowskis",
    releaseYear: 1999,
    description: "A hacker learns that the world he lives in is a simulation built by machines, and joins the rebels fighting to free humanity.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/db/The_Matrix.png",
    cast: [["keanu", "Neo"], ["fishburne", "Morpheus"], ["carrieAnne", "Trinity"]],
  },
  {
    title: "Gladiator", type: "Action", rating: 8.5, director: "Ridley Scott",
    releaseYear: 2000,
    description: "A Roman general betrayed by the emperor's son is sold into slavery and fights his way through the arena to take his revenge.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/fb/Gladiator_%282000_film_poster%29.png",
    cast: [["crowe", "Maximus"], ["joaquin", "Commodus"]],
  },
  {
    title: "The Dark Knight", type: "Action", rating: 9, director: "Christopher Nolan",
    releaseYear: 2008,
    description: "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into chaos and prove that anyone can be corrupted.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg",
    cast: [["christian", "Bruce Wayne / Batman"], ["heath", "The Joker"]],
  },
  {
    title: "Joker", type: "Crime", rating: 8.4, director: "Todd Phillips",
    releaseYear: 2019,
    description: "A failed comedian, ignored and mistreated by society, slowly turns into the violent figure who will become Gotham's most famous villain.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg",
    cast: [["joaquin", "Arthur Fleck"]],
  },
  {
    title: "Dune", type: "Sci-Fi", rating: 8, director: "Denis Villeneuve",
    releaseYear: 2021,
    description: "The heir of a noble family is sent to the desert planet Arrakis, the only source of the most valuable substance in the universe.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg",
    cast: [["timothee", "Paul Atreides"], ["zendaya", "Chani"], ["rebecca", "Lady Jessica"]],
  },
  {
    title: "Parasite", type: "Thriller", rating: 8.5, director: "Bong Joon Ho",
    releaseYear: 2019,
    description: "A poor family cleverly works its way into the household of a wealthy one, until a hidden secret turns everything upside down.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png",
    cast: [["songKangho", "Kim Ki-taek"]],
  },
  {
    title: "Saving Private Ryan", type: "War", rating: 8.6, director: "Steven Spielberg",
    releaseYear: 1998,
    description: "After the D-Day landings, a captain leads his men behind enemy lines to find a paratrooper whose three brothers have been killed.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/ac/Saving_Private_Ryan_poster.jpg",
    cast: [["hanks", "Captain John H. Miller"], ["matt", "Private James Ryan"]],
  },
  {
    title: "Catch Me If You Can", type: "Crime", rating: 8.1, director: "Steven Spielberg",
    releaseYear: 2002,
    description: "A young con man forges millions in cheques while posing as a pilot, a doctor and a lawyer, chased by a patient FBI agent.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4d/Catch_Me_If_You_Can_2002_movie.jpg",
    cast: [["leo", "Frank Abagnale Jr."], ["hanks", "Carl Hanratty"]],
  },
  {
    title: "Good Will Hunting", type: "Drama", rating: 8.3, director: "Gus Van Sant",
    releaseYear: 1997,
    description: "A janitor at MIT with a gift for mathematics is helped by a therapist to face his past and decide what to do with his life.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/52/Good_Will_Hunting.png",
    cast: [["matt", "Will Hunting"], ["robin", "Sean Maguire"]],
  },
  {
    title: "Lion of the Desert", type: "War", rating: 8.3, director: "Moustapha Akkad",
    releaseYear: 1981,
    description: "The story of Omar Mukhtar, the Libyan teacher who led his people's resistance against the Italian army for twenty years.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/59/Lion_of_the_Desert_poster.jpg",
    cast: [["quinn", "Omar Mukhtar"]],
  },
  {
    title: "الرسالة", type: "تاريخي", rating: 8.3, director: "مصطفى العقاد",
    releaseYear: 1976,
    description: "قصة بدايات الدعوة الإسلامية في مكة، والهجرة إلى المدينة، وصولاً إلى فتح مكة، كما رآها من عاشوا تلك الأيام.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/0/06/The_Message_Film_Poster.jpg",
    cast: [["ghaith", "حمزة بن عبد المطلب"], ["mona", "هند بنت عتبة"]],
  },
  {
    title: "الحدود", type: "كوميديا", rating: 8, director: "دريد لحام",
    releaseYear: 1984,
    description: "مسافر يضيع جواز سفره بين حدود بلدين، فيعلق في المنطقة الفاصلة بينهما، في سخرية مُرّة من الحدود والبيروقراطية العربية.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/d/d0/%D9%85%D9%84%D8%B5%D9%82_%D9%81%D9%8A%D9%84%D9%85_%D8%A7%D9%84%D8%AD%D8%AF%D9%88%D8%AF.jpg",
    cast: [["duraid", "عبد الودود"]],
  },
  {
    title: "الإرهاب والكباب", type: "كوميديا", rating: 7.9, director: "شريف عرفة",
    releaseYear: 1992,
    description: "موظف بسيط يذهب إلى مجمّع التحرير لنقل ابنيه إلى مدرسة أخرى، فيتحول يومه بالصدفة إلى أزمة رهائن تكشف همّ الناس العاديين.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/2/29/%D8%BA%D9%84%D8%A7%D9%81_%D8%A7%D9%84%D8%A5%D8%B1%D9%87%D8%A7%D8%A8_%D9%88%D8%A7%D9%84%D9%83%D8%A8%D8%A7%D8%A8_%281992%29.jpg",
    cast: [["adel", "أحمد فتح الباب"]],
  },
  {
    title: "الكيت كات", type: "دراما", rating: 8.3, director: "داود عبد السيد",
    releaseYear: 1991,
    description: "حكاية الشيخ حسني، الكفيف خفيف الظل الذي يعيش كأنه يرى، وسط أهل حيّ الكيت كات الشعبي في القاهرة وأحلامهم الصغيرة.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/ar/f/f8/Alketkat.jpg",
    cast: [["mahmoud", "الشيخ حسني"]],
  },
];
