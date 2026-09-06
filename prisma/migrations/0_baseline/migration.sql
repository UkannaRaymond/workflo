-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_workspaceId_name_key"
ON "Channel"("workspaceId", "name");

-- AddForeignKey
ALTER TABLE "Message"
ADD CONSTRAINT "Message_channelId_fkey"
FOREIGN KEY ("channelId") REFERENCES "Channel"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;