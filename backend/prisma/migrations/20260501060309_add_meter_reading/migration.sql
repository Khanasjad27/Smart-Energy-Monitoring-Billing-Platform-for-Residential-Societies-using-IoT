-- CreateTable
CREATE TABLE "MeterReading" (
    "id" SERIAL NOT NULL,
    "flatId" INTEGER NOT NULL,
    "unit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeterReading_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
