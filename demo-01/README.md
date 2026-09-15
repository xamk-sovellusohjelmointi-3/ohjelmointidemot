# Demo 1 - EJS-perusteet

Tässä demossa tutustutaan palvelinpään renderöintiin (Server-Side Rendering, SSR) ja Templating Engine -tekniikoihin EJS:llä. Lue alla olevat pikaohjeet demon käynnistämiseksi. Sen alla on tarkemmat kirjalliset ohjeet itse demosta.

## Pikaohjeet demoon

**0 Varmista, että sinulla on oikea Node-versio**

[.nvmrc -tiedostossa](./.nvmrc) on määritetty demossa vaadittu Noden major versio (24). Ilman tuettua versiota demo ei toimi. Voit käyttää mitä tahansa Node 24 LTS minor-versiota, kunhan se vain on 24 -"sarjaa". 

**1 Asenna versiolukitut Node-paketit/riippuvuudet**

Asenna projektin riippuvuudet (node_modules) alla olevalla komennolla tavallisen install -komennon sijaan. Tämä siksi, että Node-pakettien versiohallinta on nyt lukittu ja näin asennetaan varmasti samat versiot package-lock.json tiedostosta.

`npm ci`

**2 Lisää Prisman ympäristömuuttuja**

Luo demo-kansion juureen uusi `.env` -tiedosto ja lisää sinne seuraava rivi:

`DATABASE_URL="file:./dev.db"`

**3 Generoi Prisma-tietokanta**

Suorita komento demo-kansion juuressa komentorivillä.

`npx prisma generate`

**4 Suorita demosovellus**

Suorita komento demo-kansion juuressa komentorivillä.

`npm run dev`

## Tarkemmat ohjeet

Demon perusidea on täysin sama, mikä opintojakson opetusvideolla. Rakennetaan Express-palvelinsovellus, joka tarjoilee templating enginellä generoidut HTML-tiedostot suoraan palvelimelta ilman tarvetta selaimen JavaScript-tuelle. Templating -moottorina käytetään [EJS:ää](https://ejs.co/ "https://ejs.co/"). Demossa rakennetaan Sovellusohjelmointi 2 -opintojaksolta tuttu Ostoslista-sovelluksen käyttöliittymä ilman CRUD-toiminnallisuuksia. Ainoa toiminnallinen ominaisuus on ostosten haku Prisma-tietokannasta.

Opintojakson demovideoilla oleviin Node-pakettien versioihin on tullut päivityksiä, jonka takia suoraan videon ohjeiden seuraaminen ei enää toimi. Joudut käyttämään tarkalleen samoja versioita, mitä videoiden demoissa käytetään. Tämä on niin kauan, kunnes saan päivitettyä videot nykyhetkeen.

Node-pakettien ajantasaisimmat versiot (syksy 2026) löytyvät tästä projektista ja ne on nyt versiolukittu helpomman ylläpidon ja materiaalien paikkansapitävyyden vuoksi. Jos käytät eri versioita, joudut selvittämään mahdolliset muutokset itse. Projektin rakentaminen itsessään ei logiikan tasolla muutu, mutta muutoksia voi olla erilaisten komentojen nimissä ja tietokannan asentamisessa ja alustuksessa.

> [!NOTE] Huomio demosta
>
> Jos olet jo suorittanut vanhemman version demosta 1 itsenäisesti tai tutustunut koodeihin, sinun ei tarvitse palata tähän uudestaan. Tämä on nyt vain rakennettu ajantasaisuuden vuoksi uudelleen. Oppimistehtävässä ei käytetä Prisma-tietokantaa, vaan siinä käsiteltävät tiedot ladataan palvelimelle tiedostona. Prisma on vain tämän ja seuraavan demon kannalta oleellinen työkalu, mutta silti ehkä hyvä päivittää tietoja edelliseltä toteutukselta, koska työkalut ovat päivittyneet.
>
> Samoin MDL (Material Design Lite) on ollut jo pitkään deprekoituna. Vaihdoin demossa kokonaan tyylikirjaston Bootstrapiksi, koska se on helppoutensa vuoksi erittäin hyvä korvike. Googlen material 3 -tyylejä käyttävät työkalut ovat monimutkaisempia asentaa, eikä esimerkiksi virallinen Material 3 Web -kirjasto ole enää aktiivisessa kehityksessä, vaikka se on viimeisin versio virallisesta Material Design -tyylikirjastosta verkkosovelluksiin demon kaltaisissa tilanteissa. Fullstack frameworkeihin liitettävät kolmannen osapuolen työkalut ovat asia erikseen, mutta niitä ei käsitellä tässä.

### Prisma 7 -ohjeet

Ajantasaiset ja toimivaksi varmistetut ohjeet löydät Prisman sivuilta. Komentoja ajaessa saatat huomata, että jotkin tiedostot generoituvat eri nimillä (esim. prisma7.config.ts vs. prisma.config.ts) tai jotkin koodit ovat erilaisia. Olen varmistanut, että sivuilla olevassa ohjeistuksessa olevat koodit ja komennot ovat toimivia.

> [!WARNING] Huomio Prisma Studiosta
>
> Prisma Studiota ei välttämättä saa käyntiin komennolla:
>
> `npx prisma studio`
>
> tai
>
> `npx prisma studio --url file:./dev.db`

Olen varmistanut tekoälyn kanssa toimivaksi vaihtoehdoksi suorittaa käynnistyskomento:

> [!TIP]
>
> `npx prisma studio --url "file://$(pwd)/dev.db"`
