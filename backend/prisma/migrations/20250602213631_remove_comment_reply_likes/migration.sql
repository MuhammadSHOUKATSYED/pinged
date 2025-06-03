/*
  Warnings:

  - You are about to drop the column `commentId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `replyId` on the `Like` table. All the data in the column will be lost.
  - Made the column `postId` on table `Like` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_replyId_fkey";

-- DropIndex
DROP INDEX "Like_userId_commentId_key";

-- DropIndex
DROP INDEX "Like_userId_replyId_key";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "commentId",
DROP COLUMN "replyId",
ALTER COLUMN "postId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
