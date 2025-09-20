-- CreateEnum
CREATE TYPE "public"."TournamentType" AS ENUM ('FIXO', 'EXPONENCIAL');

-- AlterTable
ALTER TABLE "public"."tournaments" ADD COLUMN     "type" "public"."TournamentType" NOT NULL DEFAULT 'EXPONENCIAL';
