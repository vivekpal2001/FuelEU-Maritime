/*
  Warnings:

  - You are about to drop the column `created_at` on the `pool_members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pool_members" DROP COLUMN "created_at";

-- DropEnum
DROP TYPE "PoolStatusEnum";
