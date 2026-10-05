# Demo 9: palvelin

Tämä kansio sisältää demon 9 valmiin REST API -palvelimen (Express, Prisma ja SQLite). Palvelin käynnistetään ennen asiakasohjelmaa, koska asiakasohjelma hakee kaikki tehtävät palvelimelta.

> [!IMPORTANT]
> Demo on lukittu Node.js 24:ään ja `package-lock.json`-tiedoston pakettiversioihin tarkoituksella, ja tutoriaali on testattu juuri niillä versioilla. Paketit asennetaan komennolla `npm ci`. Muut versiot (komennosta ilman versionumeroa, kirjaston omista ohjeista kopioidusta komennosta tai hyväksytystä "update available" -kehotteesta) voivat poiketa tutoriaalista eivätkä välttämättä toimi.

1. Paketit asennetaan `server`-kansiossa:

   ```bash
   cd server
   npm ci
   ```

2. `server`-kansioon luodaan tiedosto `.env`, jossa on tietokannan osoite:

   ```text
   DATABASE_URL="file:./dev.db"
   ```

3. Prisma-asiakas generoidaan:

   ```bash
   npx prisma generate
   ```

   Jos komento tulostaa ilmoituksen "Update available … `npm i --save-dev prisma@latest`", se ohitetaan. Komento asentaisi Prisman version 8, jonka rajapinta poikkeaa demon käyttämästä versiosta 7.

4. Palvelin käynnistetään:

   ```bash
   npm run dev
   ```

Palvelin käynnistyy osoitteeseen <http://localhost:3009> ja tulostaa terminaaliin rivin `Palvelin käynnistettiin osoitteeseen: http://localhost:3009`. Terminaali jätetään auki, kun asiakasohjelmaa käytetään.
