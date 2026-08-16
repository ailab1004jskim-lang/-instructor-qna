-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "lastEmailError" TEXT,
ADD COLUMN     "lastEmailErrorAt" TIMESTAMP(3),
ADD COLUMN     "lastEmailOkAt" TIMESTAMP(3);
