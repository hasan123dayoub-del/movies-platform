-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "streamUrl" TEXT,
ADD COLUMN     "trailerYoutubeId" TEXT;

-- AlterTable
ALTER TABLE "Series" ADD COLUMN     "trailerYoutubeId" TEXT;
