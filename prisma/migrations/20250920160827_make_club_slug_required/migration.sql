/*
  Warnings:

  - Made the column `slug` on table `clubs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."clubs" ALTER COLUMN "slug" SET NOT NULL;
