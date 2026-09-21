# Demo 7: SQLite

Seitsemännessä demossa rakennetaan ostoslista, jonka tiedot tallennetaan puhelimen omaan SQLite-tietokantaan. Sovellus avautuu listaan, jossa on valmiina kolme ostosta. Uuden ostoksen voi lisätä painikkeella avautuvassa ikkunassa, ja yksittäisen ostoksen voi poistaa sen perässä olevalla roskakorikuvakkeella. Koko listan voi myös tyhjentää kerralla. Tiedot ovat tietokannassa, joten lista säilyy, vaikka sovellus suljetaan ja avataan uudelleen.

## Sisällysluettelo

- [1 SQLite ja expo-sqlite](#1-sqlite-ja-expo-sqlite)
  - [1.1 Kirjaston asentaminen](#11-kirjaston-asentaminen)
  - [1.2 SQLiteProvider ja tietokannan avaaminen](#12-sqliteprovider-ja-tietokannan-avaaminen)
- [2 Tietokannan alustaminen ja versiointi](#2-tietokannan-alustaminen-ja-versiointi)
- [3 Kyselyt db.sql-rajapinnalla](#3-kyselyt-dbsql-rajapinnalla)
  - [3.1 Ostosten hakeminen](#31-ostosten-hakeminen)
  - [3.2 Lisääminen, poistaminen ja tyhjentäminen](#32-lisääminen-poistaminen-ja-tyhjentäminen)
- [4 Käyttöliittymä](#4-käyttöliittymä)
  - [4.1 Ostoslista ja poistopainikkeet](#41-ostoslista-ja-poistopainikkeet)
  - [4.2 Lisäysikkuna Dialog-komponentilla](#42-lisäysikkuna-dialog-komponentilla)
- [5 Sovelluksen testaaminen](#5-sovelluksen-testaaminen)

**Projektin asentaminen ja käynnistäminen**

Demo on luotu samasta Expo SDK 57:n `blank-typescript`-mallipohjasta kuin [demo 4](../demo-04/README.md), ja se on versiolukittu `package.json`- ja `package-lock.json`-tiedostoissa määritettyihin riippuvuusversioihin. Tässäkään demossa ei ole `.nvmrc`-tiedostoa eikä `engines`-kenttää.

Asenna riippuvuudet ja käynnistä kehityspalvelin samoilla komennoilla kuin demossa 4:

```bash
npm ci
npx expo start
```

`npm ci`:n ja `npm install`:n ero on selitetty [demon 4 README:n](../demo-04/README.md) alussa. Expo Gon käyttö ja muut käynnistystavat ovat demon 4 luvussa [2.2](../demo-04/README.md#22-sovelluksen-käynnistäminen-expo-gossa).

Käyttöliittymä on rakennettu React Native Paper -kirjastolla samoin kuin demoissa 5 ja 6. Paperin ja sen kuvakkeiden asennus on käyty läpi demon 5 luvussa [1.1](../demo-05/README.md#11-kirjaston-ja-kuvakkeiden-asentaminen). `PaperProvider`-komponentin kiinteä vaalea teema on selitetty luvussa [1.2](../demo-05/README.md#12-paperprovider-ja-teema), ja yläpalkki `Appbar` luvussa [1.3](../demo-05/README.md#13-appbar-yläpalkki). Tässä README:ssä käydään läpi vain demon uudet asiat.

## 1 SQLite ja expo-sqlite

Kolmen ensimmäisen demon palvelinsovelluksissa tiedot tallennettiin palvelimella olevaan SQLite-tietokantaan Prisman avulla. Tässä demossa SQLite-tietokanta on puhelimessa, ja sitä käsitellään suoraan SQL-lauseilla.

SQLite on tietokanta, joka tallennetaan yhteen tiedostoon. Sitä varten ei tarvita erillistä tietokantapalvelinta, joten se sopii mobiilisovelluksen omien tietojen tallentamiseen. Tietokantatiedosto on sovelluksen omassa kansiossa, ja Expon dokumentaation mukaan se säilyy sovelluksen uudelleenkäynnistysten yli.

### 1.1 Kirjaston asentaminen

SQLite otetaan käyttöön Expo SDK:n `expo-sqlite`-kirjastolla, joka asennetaan komennolla

```bash
npx expo install expo-sqlite
```

`npx expo install` lisää `app.json`-tiedoston `plugins`-kenttään myös kirjaston config pluginin `"expo-sqlite"`. Demossa pluginille ei ole annettu omia asetuksia. Config pluginien merkitys on selitetty demon 5 luvussa [1.1](../demo-05/README.md#11-kirjaston-ja-kuvakkeiden-asentaminen).

### 1.2 SQLiteProvider ja tietokannan avaaminen

Tietokanta avataan `SQLiteProvider`-komponentilla, joka sijoitetaan sovelluksen uloimmaksi komponentiksi:

```tsx
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
```

```tsx
export default function App() {
    return (
        <SQLiteProvider databaseName="ostokset.db" onInit={alustaKanta}>
            <PaperProvider theme={MD3LightTheme}>

                <Appbar.Header>
                    <Appbar.Content title="Demo 7: SQLite" />
                </Appbar.Header>

                <Ostoslista />

                <StatusBar style="dark" />

            </PaperProvider>
        </SQLiteProvider>
    );
}
```

`SQLiteProvider`-komponentin propsit:

- `databaseName`: tietokantatiedoston nimi. Jos tiedostoa ei vielä ole, se luodaan ensimmäisellä käynnistyskerralla.
- `onInit`: funktio, joka suoritetaan ennen kuin `SQLiteProvider`-komponentin sisältö renderöidään. Siinä luodaan tietokannan taulu, joten sisällä olevat komponentit voivat käyttää taulua heti. Funktio `alustaKanta` käydään läpi luvussa 2.

Sisällä olevat komponentit saavat avatun tietokannan käyttöönsä `useSQLiteContext`-hookilla:

```tsx
function Ostoslista() {

    const db = useSQLiteContext();
```

`useSQLiteContext` toimii vain `SQLiteProvider`-komponentin sisällä. `App`-komponentti itse renderöi `SQLiteProvider`-komponentin, joten tietokantaa käyttävä koodi on kirjoitettu erilliseen `Ostoslista`-komponenttiin. Sama koskee Paperin `useTheme`-hookia, jota käytetään luvussa 4.1.

## 2 Tietokannan alustaminen ja versiointi

Nyt tietokanta avataan sovelluksen käynnistyessä. Seuraavaksi käydään läpi `onInit`-propsille annettu `alustaKanta`-funktio, jossa tietokantaan luodaan taulu ja alkutiedot:

```tsx
const TIETOKANNAN_VERSIO = 1;

async function alustaKanta(db: SQLiteDatabase): Promise<void> {

    const tulos = await db.sql<{ user_version: number }>`PRAGMA user_version`.first();
    const nykyinenVersio = tulos?.user_version ?? 0;

    if (nykyinenVersio >= TIETOKANNAN_VERSIO) {
        return;
    }

    if (nykyinenVersio === 0) {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS ostokset (id INTEGER PRIMARY KEY AUTOINCREMENT, tuote TEXT NOT NULL);
            INSERT INTO ostokset (tuote) VALUES ('Maito'), ('Kahvi'), ('Leipä');
        `);
    }

    await db.execAsync(`PRAGMA user_version = ${TIETOKANNAN_VERSIO}`);
}
```

Funktiossa käytetään Expon dokumentaation suosittelemaa tapaa, jossa tietokannan rakenteelle annetaan versionumero. SQLite tallentaa tietokantatiedostoon kokonaisluvun `user_version`, joka on uudessa tietokannassa `0`. Funktio etenee näin:

1. Tietokannan nykyinen versio luetaan `PRAGMA user_version` -lauseella.
2. Jos tietokanta on jo ajan tasalla, funktiosta palataan heti. Näin käyttäjän tiedot säilyvät seuraavilla käynnistyskerroilla.
3. Jos versio on `0`, tietokanta on uusi. Siihen luodaan `ostokset`-taulu ja lisätään kolme alkuostosta.
4. Lopuksi tietokannan versioksi asetetaan `TIETOKANNAN_VERSIO`.

Jos taulun rakenne muuttuu myöhemmin, `TIETOKANNAN_VERSIO`-arvoa kasvatetaan ja funktioon lisätään uusi ehto, esimerkiksi `nykyinenVersio === 1`. Silloin olemassa olevan tietokannan rakennetta päivitetään ilman, että käyttäjän tiedot katoavat.

`ostokset`-taulussa on kaksi saraketta:

- `id`: ostoksen yksilöivä tunniste. `INTEGER PRIMARY KEY AUTOINCREMENT` muodostaa uuden id-arvon automaattisesti jokaiselle lisätylle riville.
- `tuote`: ostoksen nimi. `NOT NULL` estää rivin tallentamisen ilman nimeä.

`IF NOT EXISTS` estää virheen, jos taulu on jo olemassa esimerkiksi demon aiemman version jäljiltä. `PRAGMA journal_mode = WAL` on Expon dokumentaation esimerkin mukainen asetus, joka nopeuttaa tietokantaa, kun sitä luetaan ja siihen kirjoitetaan samaan aikaan.

`execAsync()`-metodilla suoritetaan kerralla useita SQL-lauseita. Tauluja luovissa ja `PRAGMA`-lauseissa ei ole käyttäjän syöttämiä arvoja, joten ne kirjoitetaan tavallisena merkkijonona.

> [!WARNING]
>
> `execAsync()`-metodille annettuja arvoja ei suojata mitenkään. Viimeisellä rivillä `${TIETOKANNAN_VERSIO}` on tavallisen JavaScript-merkkijonon sisään kirjoitettu arvo, joka muuttuu osaksi SQL-lausetta. Tämä on turvallista vain, koska arvo on koodissa määritetty vakio. Käyttäjän syöttämät arvot annetaan aina luvun 3 `db.sql`-rajapinnalla, jossa ne välitetään tietokannalle erillisinä parametreina.

## 3 Kyselyt db.sql-rajapinnalla

Tietokanta on nyt alustettu. Seuraavaksi `Ostoslista`-komponentissa haetaan ja muokataan ostoksia. Kyselyt kirjoitetaan `db.sql`-rajapinnalla, jossa SQL-lause kirjoitetaan backtick-merkkien sisään ja lauseen eteen kirjoitetaan `db.sql`.

Tietokannan rivin rakenne kuvataan rajapintana:

```tsx
interface Ostos {
    id: number;
    tuote: string;
}
```

`db.sql`-rajapinnalla on kolme ominaisuutta, jotka vaikuttavat demon koodiin:

- `${}`-merkintöjen sisällä olevia arvoja ei kirjoiteta SQL-lauseen sekaan. Ne välitetään tietokannalle erillisinä parametreina, joten käyttäjän syöttämä teksti ei voi muuttaa SQL-lauseen rakennetta.
- `SELECT`-lause palauttaa rivit taulukkona. `INSERT`- ja `DELETE`-lauseet palauttavat tiedon muutetuista riveistä, jota demossa ei käytetä.
- Tyyppiparametrilla, esimerkiksi `db.sql<Ostos>`, määritetään palautettujen rivien tyyppi. Tietokannan rivien rakennetta ei voi päätellä SQL-lauseesta. Ilman tyyppiparametria tuloksen tyyppi on `unknown[] | SQLiteRunResult`, eikä sitä voi tallentaa `Ostos[]`-tyyppiseen tilamuuttujaan.

> [!NOTE]
>
> `db.sql`-rajapinta on expo-sqlite-kirjaston uudempi tapa kirjoittaa kyselyjä. Monissa ohjeissa ja useimmissa Expon dokumentaation esimerkeissä käytetään metodeja `getAllAsync()` ja `runAsync()`. Niissä SQL-lauseen arvot merkitään `?`-merkeillä ja annetaan metodille erillisinä parametreina. `db.sql` kutsuu kirjaston sisällä samoja metodeja, joten molemmat tavat ovat yhtä turvallisia.

### 3.1 Ostosten hakeminen

Ostokset haetaan `ostokset`-tilamuuttujaan `haeOstokset`-funktiolla:

```tsx
const [ostokset, setOstokset] = useState<Ostos[]>([]);

const haeOstokset = async (): Promise<void> => {
    const rivit = await db.sql<Ostos>`SELECT * FROM ostokset ORDER BY id`;
    setOstokset(rivit);
};
```

`SELECT * FROM ostokset` hakee taulun kaikki rivit. SQL ei takaa rivien järjestystä ilman `ORDER BY`-määritystä, joten rivit järjestetään id-arvon mukaan. Uusin ostos näkyy siis listan viimeisenä.

Lista haetaan ensimmäisen kerran, kun komponentti on renderöity:

```tsx
useEffect(() => {
    haeOstokset();
}, []);
```

Tyhjä riippuvuustaulukko `[]` määrittää, että `useEffect`-hookin funktio suoritetaan vain kerran komponentin ensimmäisen renderöinnin jälkeen. `onInit`-funktiossa tietokanta vain valmistellaan, joten tiedot pitää silti hakea komponentin tilaan.

### 3.2 Lisääminen, poistaminen ja tyhjentäminen

Ostoslistaa muokataan kolmella funktiolla:

```tsx
const lisaaOstos = async (): Promise<void> => {
    await db.sql`INSERT INTO ostokset (tuote) VALUES (${dialogi.teksti.trim()})`;
    await haeOstokset();
    setDialogi({ auki: false, teksti: "" });
};

const poistaOstos = async (id: number): Promise<void> => {
    await db.sql`DELETE FROM ostokset WHERE id = ${id}`;
    await haeOstokset();
};

const tyhjennaLista = async (): Promise<void> => {
    await db.sql`DELETE FROM ostokset`;
    await haeOstokset();
};
```

- `lisaaOstos`: lisää lisäysikkunaan kirjoitetun tekstin uudeksi riviksi. `trim()` poistaa tekstin alusta ja lopusta välilyönnit. Lisäyksen jälkeen ikkuna suljetaan ja tekstikenttä tyhjennetään.
- `poistaOstos`: poistaa rivin, jonka id annetaan parametrina. `WHERE`-ehto rajaa poiston tähän yhteen riviin.
- `tyhjennaLista`: poistaa taulun kaikki rivit, koska `DELETE`-lauseessa ei ole `WHERE`-ehtoa.

Jokaisen muutoksen jälkeen lista haetaan tietokannasta uudelleen `haeOstokset`-funktiolla. `ostokset`-tilamuuttuja on kopio tietokannan sisällöstä, ja uudelleenhaku on yksinkertaisin tapa pitää ne samanlaisina. Esimerkiksi uuden ostoksen id-arvo saadaan näin mukaan ilman erillistä käsittelyä.

`lisaaOstos` asettaa `dialogi`-tilamuuttujalle kokonaan uuden arvon, joten päivitysfunktiota ei tarvita. Muissa kohdissa `dialogi`-tilaa päivitetään edellisen arvon pohjalta päivitysfunktiolla, joka on selitetty demon 6 luvussa [2](../demo-06/README.md#2-sovelluksen-tila-ja-kaksi-näkymää).

## 4 Käyttöliittymä

Tietokantaa käsittelevät funktiot ovat nyt valmiina. Seuraavaksi ne liitetään käyttöliittymään. Näkymässä on ostoslista ja sen alla kaksi painiketta, ja uusi ostos kirjoitetaan erilliseen ikkunaan.

### 4.1 Ostoslista ja poistopainikkeet

```tsx
<ScrollView contentContainerStyle={{ padding: 20 }}>

    <Text variant="headlineSmall">Ostoslista</Text>

    {ostokset.length > 0
        ? ostokset.map((ostos) => (
            <List.Item
                key={ostos.id}
                title={ostos.tuote}
                right={() => (
                    <IconButton
                        icon="delete"
                        accessibilityLabel={`Poista ${ostos.tuote}`}
                        onPress={() => poistaOstos(ostos.id)}
                    />
                )}
            />
        ))
        : <Text>Ei ostoksia</Text>
    }
```

`ScrollView` on vieritettävä säiliö, jonka sisältöä voi vierittää, kun se ei mahdu näytölle. Ostokset tulostetaan `map()`-funktiolla samaan tapaan kuin web-Reactissa. Avaimena käytetään tietokannan id-arvoa, joka on jokaisella rivillä eri. Jos taulukko on tyhjä, listan tilalle tulostetaan teksti "Ei ostoksia".

> [!TIP]
>
> Ostoslista on lyhyt, joten `ScrollView` ja `map()` riittävät. Pitkissä listoissa käytetään `FlatList`-komponenttia, joka renderöi vain näkyvät rivit. Se esiteltiin demon 6 luvussa [4](../demo-06/README.md#4-otettujen-kuvien-lista).

Jokainen ostos on `List.Item`-rivi, joka tuli tutuksi demon 5 luvussa [2](../demo-05/README.md#2-laitteen-perustiedot-ja-avattava-lista). Tässä rivin oikeaan reunaan lisätään `right`-propsilla funktio, joka palauttaa poistopainikkeen. `IconButton` on Paperin painike, jossa on pelkkä kuvake. Koska painikkeessa ei ole tekstiä, sille annetaan `accessibilityLabel`, jonka ruudunlukija lukee ääneen. Painike kutsuu `poistaOstos`-funktiota kyseisen ostoksen id-arvolla.

Listan alla on kaksi painiketta:

```tsx
<Button
    style={{ marginTop: 20 }}
    mode="contained"
    icon="plus"
    onPress={() => setDialogi((edellinen) => ({ ...edellinen, auki: true }))}
>Lisää uusi ostos</Button>

<Button
    style={{ marginTop: 20 }}
    buttonColor={theme.colors.error}
    textColor={theme.colors.onError}
    mode="contained"
    icon="delete"
    onPress={tyhjennaLista}
>Tyhjennä lista</Button>
```

"Lisää uusi ostos" avaa lisäysikkunan. "Tyhjennä lista" poistaa kaikki ostokset, joten se on väritetty teeman virhevärillä. Teeman värit haetaan Paperin `useTheme`-hookilla:

```tsx
const theme = useTheme();
```

`useTheme` palauttaa `PaperProvider`-komponentille annetun teeman. `theme.colors.error` on teeman punainen virheväri, ja `theme.colors.onError` on sen päällä käytettävä tekstin väri. Kun värit haetaan teemasta, ne sopivat yhteen sovelluksen muiden värien kanssa.

### 4.2 Lisäysikkuna Dialog-komponentilla

Uusi ostos kirjoitetaan ikkunaan, joka avautuu muun näkymän päälle. Ikkunan tila tallennetaan `dialogi`-tilamuuttujaan:

```tsx
interface DialogiData {
    auki: boolean;
    teksti: string;
}
```

```tsx
const [dialogi, setDialogi] = useState<DialogiData>({ auki: false, teksti: "" });
```

`auki` määrittää, näkyykö ikkuna, ja `teksti` on ikkunan tekstikenttään kirjoitettu ostos. Ikkuna on Paperin `Dialog`-komponentti:

```tsx
<Portal>
    <Dialog
        visible={dialogi.auki}
        onDismiss={() => setDialogi((edellinen) => ({ ...edellinen, auki: false }))}
    >
        <Dialog.Title>Lisää uusi ostos</Dialog.Title>
        <Dialog.Content>
            <TextInput
                label="Ostos"
                mode="outlined"
                value={dialogi.teksti}
                placeholder="Kirjoita ostos..."
                onChangeText={(uusiTeksti) => setDialogi((edellinen) => ({ ...edellinen, teksti: uusiTeksti }))}
            />
        </Dialog.Content>
        <Dialog.Actions>
            <Button
                disabled={!dialogi.teksti.trim()}
                onPress={lisaaOstos}
            >Lisää listaan</Button>
        </Dialog.Actions>
    </Dialog>
</Portal>
```

`Dialog` kirjoitetaan `Portal`-komponentin sisään. `Portal` renderöi sisältönsä `PaperProvider`-komponentin ylimmälle tasolle, jolloin ikkuna näkyy kaikkien muiden komponenttien päällä riippumatta siitä, missä kohtaa koodia se on kirjoitettu.

`Dialog`-komponentin propsit ja osat:

- `visible`: ikkuna näkyy, kun arvo on `true`.
- `onDismiss`: funktio, joka suoritetaan, kun käyttäjä painaa ikkunan ulkopuolelta tai Androidin takaisin-painiketta. Demossa ikkuna suljetaan, ja kirjoitettu teksti jää talteen seuraavaa avauskertaa varten.
- `Dialog.Title`: ikkunan otsikko.
- `Dialog.Content`: ikkunan sisältö, tässä tekstikenttä.
- `Dialog.Actions`: ikkunan alareunan painikkeet.

Tekstikenttä on Paperin `TextInput`-komponentti. Sille annetaan otsikko `label`-propsilla, ja `mode="outlined"` piirtää kentälle reunaviivan. Kenttä on sidottu `dialogi.teksti`-arvoon `value`- ja `onChangeText`-propseilla samalla tavalla kuin demon 4 luvussa [4.3](../demo-04/README.md#43-tekstikenttä-ja-tilamuuttuja).

"Lisää listaan" -painike on pois käytöstä, kun `dialogi.teksti.trim()` on tyhjä merkkijono. Näin listaan ei voi lisätä tyhjää ostosta tai ostosta, jossa on pelkkiä välilyöntejä.

Valmis sovellus on kokonaisuudessaan tiedostossa [App.tsx](./App.tsx).

## 5 Sovelluksen testaaminen

Sovellus on nyt valmis. Sitä testataan puhelimessa näin:

1. Käynnistä kehityspalvelin ja avaa sovellus Expo Gossa samoin kuin demossa 4. Listassa näkyvät `alustaKanta`-funktiossa lisätyt kolme alkuostosta.
2. Paina "Lisää uusi ostos". Ikkunan "Lisää listaan" -painike tulee käyttöön vasta, kun tekstikenttään kirjoitetaan jotain.
3. Kirjoita ostos ja paina "Lisää listaan". Uusi ostos näkyy listan viimeisenä.
4. Poista jokin ostos sen perässä olevalla roskakorikuvakkeella.
5. Lataa sovellus uudelleen painamalla kehityspalvelimen terminaalissa `r`. Lista näkyy samanlaisena kuin ennen uudelleenlatausta.
6. Paina "Tyhjennä lista" ja lataa sovellus uudelleen. Lista pysyy tyhjänä, koska tietokannan versio on jo `1` eikä alkuostoksia lisätä uudelleen.

> [!TIP]
>
> Expon dokumentaation mukaan tietokannan sisältöä voi tarkastella kehityksen aikana selaimessa. Paina kehityspalvelimen terminaalissa `Shift+M` ja valitse avautuvasta valikosta "Open expo-sqlite". Työkalulla voi selata tauluja ja suorittaa SQL-kyselyjä.

Kehityspalvelin pysäytetään `Ctrl+C`:llä kuten demossa 4.
