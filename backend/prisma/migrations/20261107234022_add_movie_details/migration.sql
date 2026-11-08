-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "description" TEXT,
ADD COLUMN     "releaseYear" INTEGER;

-- CreateIndex
CREATE INDEX "Movie_type_idx" ON "Movie"("type");
