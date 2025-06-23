/*
  Warnings:

  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Share` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_postId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_userId_fkey";

-- DropTable
DROP TABLE "Reply";

-- DropTable
DROP TABLE "Share";
