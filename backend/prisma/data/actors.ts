const COMMONS = "https://thumb.wikimedia.org/wikipedia/commons/thumb";

// Actors, keyed by a short name so the movies below can point to them
export const actors = {
  leo: { name: "Leonardo DiCaprio", birthday: "1974-11-11", nationality: "American", photoUrl: `${COMMONS}/2/2d/LeoPTABFI191125-28_%28cropped%29.jpg/330px-LeoPTABFI191125-28_%28cropped%29.jpg` },
  kate: { name: "Kate Winslet", birthday: "1975-10-05", nationality: "British", photoUrl: `${COMMONS}/5/53/KateWinslet_%28cropped%29.jpg/330px-KateWinslet_%28cropped%29.jpg` },
  tom: { name: "Tom Hardy", birthday: "1977-09-15", nationality: "British", photoUrl: `${COMMONS}/3/30/Tom_Hardy_Locke_Premiere.jpg/330px-Tom_Hardy_Locke_Premiere.jpg` },
  joseph: { name: "Joseph Gordon-Levitt", birthday: "1981-02-17", nationality: "American", photoUrl: `${COMMONS}/0/01/Joseph_Gordon_Levitt_Sundance_Film_Festival_2026_%28cropped%29.jpg/330px-Joseph_Gordon_Levitt_Sundance_Film_Festival_2026_%28cropped%29.jpg` },
  margot: { name: "Margot Robbie", birthday: "1990-07-02", nationality: "Australian", photoUrl: `${COMMONS}/9/90/Margot_Robbie_Wuthering_Heights_premiere_%28cropped%29.jpg/330px-Margot_Robbie_Wuthering_Heights_premiere_%28cropped%29.jpg` },
  cillian: { name: "Cillian Murphy", birthday: "1976-05-25", nationality: "Irish", photoUrl: `${COMMONS}/e/ed/Cillian_Murphy_at_the_London_premier_of_Steve_in_September_2025_%28cropped%29.jpg/330px-Cillian_Murphy_at_the_London_premier_of_Steve_in_September_2025_%28cropped%29.jpg` },
  matthew: { name: "Matthew McConaughey", birthday: "1969-11-04", nationality: "American", photoUrl: `${COMMONS}/0/0d/Matthew_McConaughey_at_the_2025_Toronto_Film_Festival_%283x4_cropped%29.jpg/330px-Matthew_McConaughey_at_the_2025_Toronto_Film_Festival_%283x4_cropped%29.jpg` },
  anne: { name: "Anne Hathaway", birthday: "1982-11-12", nationality: "American", photoUrl: `${COMMONS}/a/a5/AnneHathaway-byPhilipRomano-Crop.jpg/330px-AnneHathaway-byPhilipRomano-Crop.jpg` },
  jessica: { name: "Jessica Chastain", birthday: "1977-03-24", nationality: "American", photoUrl: `${COMMONS}/1/11/Jessica_Chastain-64631_%28cropped%29.jpg/330px-Jessica_Chastain-64631_%28cropped%29.jpg` },
  christian: { name: "Christian Bale", birthday: "1974-01-30", nationality: "British", photoUrl: `${COMMONS}/0/0a/Christian_Bale-7837.jpg/330px-Christian_Bale-7837.jpg` },
  emily: { name: "Emily Blunt", birthday: "1983-02-23", nationality: "British", photoUrl: `${COMMONS}/4/45/Emily_Blunt_at_WWD_Style_Awards_2026-02.jpg/330px-Emily_Blunt_at_WWD_Style_Awards_2026-02.jpg` },
  matt: { name: "Matt Damon", birthday: "1970-10-08", nationality: "American", photoUrl: `${COMMONS}/f/f9/MattDamon-byPhilipRomano2.jpg/330px-MattDamon-byPhilipRomano2.jpg` },
  ryan: { name: "Ryan Gosling", birthday: "1980-11-12", nationality: "Canadian", photoUrl: `${COMMONS}/6/62/GoslingBFI081223_%2822_of_30%29_%2853388157347%29_%28cropped%29.jpg/330px-GoslingBFI081223_%2822_of_30%29_%2853388157347%29_%28cropped%29.jpg` },
  charlize: { name: "Charlize Theron", birthday: "1975-08-07", nationality: "South African", photoUrl: `${COMMONS}/7/73/CharlizeTheron-byPhilipRomano2.jpg/330px-CharlizeTheron-byPhilipRomano2.jpg` },
  jack: { name: "Jack Nicholson", birthday: "1937-04-22", nationality: "American", photoUrl: `${COMMONS}/c/cf/Jack_Nicholson_2002.jpg/330px-Jack_Nicholson_2002.jpg` },
  mark: { name: "Mark Ruffalo", birthday: "1967-11-22", nationality: "American", photoUrl: `${COMMONS}/1/11/Mark_Ruffalo_%2836201774756%29_%28cropped%29.jpg/330px-Mark_Ruffalo_%2836201774756%29_%28cropped%29.jpg` },
  emma: { name: "Emma Stone", birthday: "1988-11-06", nationality: "American", photoUrl: `${COMMONS}/2/23/Emma_Stone_at_the_2025_Venice_Film_Festival-6313_%28cropped%29.jpg/330px-Emma_Stone_at_the_2025_Venice_Film_Festival-6313_%28cropped%29.jpg` },
  brad: { name: "Brad Pitt", birthday: "1963-12-18", nationality: "American", photoUrl: `${COMMONS}/9/90/Brad_Pitt-69858.jpg/330px-Brad_Pitt-69858.jpg` },
  liam: { name: "Liam Neeson", birthday: "1952-06-07", nationality: "Northern Irish", photoUrl: `${COMMONS}/f/fe/Liam_Neeson_Deauville_2012_2.jpg/330px-Liam_Neeson_Deauville_2012_2.jpg` },
  ralph: { name: "Ralph Fiennes", birthday: "1962-12-22", nationality: "British", photoUrl: `${COMMONS}/2/23/ConclaveBFILFF101024_%2816_of_44%29_%2854062064271%29_%28cropped%29.jpg/330px-ConclaveBFILFF101024_%2816_of_44%29_%2854062064271%29_%28cropped%29.jpg` },
  ben: { name: "Ben Kingsley", birthday: "1943-12-31", nationality: "British", photoUrl: `${COMMONS}/4/42/Ben_Kingsley_by_Gage_Skidmore.jpg/330px-Ben_Kingsley_by_Gage_Skidmore.jpg` },
  maggie: { name: "Maggie Grace", birthday: "1983-09-21", nationality: "American", photoUrl: `${COMMONS}/a/a1/Maggie_Grace_by_Gage_Skidmore_2.jpg/330px-Maggie_Grace_by_Gage_Skidmore_2.jpg` },
};

export type ActorKey = keyof typeof actors;
