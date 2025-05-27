/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "createdAt",
DROP COLUMN "isRead",
ADD COLUMN     "readAt" TIMESTAMP(3);
