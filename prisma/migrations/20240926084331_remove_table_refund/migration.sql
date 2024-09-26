/*
  Warnings:

  - You are about to drop the `Refund` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_paymentId_fkey";

-- DropTable
DROP TABLE "Refund";
