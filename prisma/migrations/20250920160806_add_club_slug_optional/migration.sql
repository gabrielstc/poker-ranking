/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `clubs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."players" DROP CONSTRAINT "players_clubId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tournaments" DROP CONSTRAINT "tournaments_clubId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_clubId_fkey";

-- AlterTable
ALTER TABLE "public"."clubs" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "public"."clubs"("slug");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."players" ADD CONSTRAINT "players_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tournaments" ADD CONSTRAINT "tournaments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
