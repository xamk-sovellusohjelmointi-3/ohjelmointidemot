-- CreateTable
CREATE TABLE "Tehtava" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nimi" TEXT NOT NULL,
    "suoritettu" BOOLEAN NOT NULL DEFAULT false
);
