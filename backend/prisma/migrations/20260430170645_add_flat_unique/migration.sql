/*
  Warnings:

  - A unique constraint covering the columns `[flatNumber,floor,societyId]` on the table `Flat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Flat_flatNumber_floor_societyId_key" ON "Flat"("flatNumber", "floor", "societyId");
