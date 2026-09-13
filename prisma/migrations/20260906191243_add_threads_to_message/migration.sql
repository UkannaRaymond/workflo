-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "threadId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
