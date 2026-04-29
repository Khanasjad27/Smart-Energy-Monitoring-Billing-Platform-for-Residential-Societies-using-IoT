-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_societyId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "societyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE SET NULL ON UPDATE CASCADE;
