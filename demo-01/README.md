# Ohjeet demoon

**1 Asenna versiolukitut Node-paketit/riippuvuudet**

`npm ci`

**2 Lisää Prisman ympäristömuuttuja**

Luo .env -tiedosto ja lisää sinne seuraava rivi:

`DATABASE_URL="file:./dev.db"`

**3 Generoi Prisma-tietokanta**

`npx prisma generate`

**4 Suorita demosovellus**

`npm run dev`