// Sample member reviews, so the live site shows ratings and comments from the start.
// The reviewers are sample members with random passwords (nobody can log in as them),
// except "user", the public demo account.

export const reviewers = {
  user: { name: "Demo User", email: "user@movies.dev" },
  lina: { name: "Lina", email: "lina@movies.dev" },
  omar: { name: "Omar", email: "omar@movies.dev" },
  sara: { name: "Sara", email: "sara@movies.dev" },
  karim: { name: "Karim", email: "karim@movies.dev" },
} as const;

export type ReviewerKey = keyof typeof reviewers;

type SampleReview = [reviewer: ReviewerKey, rating: number, comment?: string];

// Reviews by movie title
export const movieReviews: Record<string, SampleReview[]> = {
  "The Shawshank Redemption": [
    ["lina", 10, "Hope is a good thing, maybe the best of things. A film I rewatch every year."],
    ["omar", 9, "Slow at first, then it never lets go. That ending!"],
    ["karim", 10],
  ],
  "The Godfather": [
    ["omar", 10, "Every scene is a lesson in filmmaking."],
    ["sara", 8, "Long, but worth every minute."],
  ],
  "The Dark Knight": [
    ["karim", 10, "Heath Ledger's Joker is unforgettable."],
    ["lina", 9],
    ["user", 9, "The best superhero film ever made."],
  ],
  Inception: [
    ["sara", 9, "I watched it twice to follow every layer of the dream."],
    ["omar", 8, "The music by Hans Zimmer carries the whole film."],
  ],
  Interstellar: [
    ["lina", 10, "The docking scene and the soundtrack gave me chills."],
    ["karim", 8, "The science is heavy, but the father and daughter story hits hard."],
  ],
  Parasite: [
    ["sara", 9, "Funny, then tense, then shocking. Brilliant."],
    ["user", 8],
  ],
  Oppenheimer: [["omar", 8, "Three hours that felt like one. The sound design is incredible."]],
  "La La Land": [
    ["lina", 9, "Bittersweet and beautiful. The last ten minutes!"],
    ["karim", 6, "Lovely music, but not my kind of film."],
  ],
  Joker: [["karim", 8, "Joaquin Phoenix is outstanding, though it is a hard watch."]],
  "الرسالة": [
    ["omar", 10, "عمل خالد، والموسيقى التصويرية لموريس جار رائعة."],
    ["sara", 9, "من أجمل الأفلام التاريخية العربية."],
  ],
  "الإرهاب والكباب": [["lina", 9, "عادل إمام في أفضل حالاته، كوميديا ذكية ومؤثرة."]],
};

// Reviews by series title
export const seriesReviews: Record<string, SampleReview[]> = {
  "Breaking Bad": [
    ["karim", 10, "Walter White's change from teacher to kingpin is perfect television."],
    ["omar", 10],
    ["user", 9, "Season 5 is a masterpiece."],
  ],
  Chernobyl: [
    ["lina", 10, "Terrifying because it really happened."],
    ["sara", 9],
  ],
  Friends: [
    ["sara", 9, "My comfort show. I know every episode by heart."],
    ["karim", 7, "Funny, but some jokes have aged badly."],
  ],
  Dark: [["omar", 9, "Keep notes while you watch, it's worth it."]],
  "Game of Thrones": [
    ["lina", 8, "Seasons 1 to 4 are the best TV ever made. The ending, not so much."],
    ["karim", 7],
  ],
  "ضيعة ضايعة": [
    ["omar", 10, "أسعد وجودة ثنائي لا يتكرر، كوميديا سورية أصيلة."],
    ["lina", 10, "أعيد مشاهدته كل سنة وما بمل منه."],
    ["sara", 9],
  ],
  "التغريبة الفلسطينية": [["karim", 10, "من أصدق ما قُدّم في الدراما العربية."]],
  "الهيبة": [["sara", 7, "الجزء الأول ممتاز، والأجزاء التالية أضعف."]],
};
