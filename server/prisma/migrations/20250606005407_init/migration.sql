-- CreateTable
CREATE TABLE "Dream" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);
