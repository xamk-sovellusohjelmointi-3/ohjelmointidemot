# Demo 6: Kamera

Kuudennessa demossa rakennetaan sovellus, jolla otetaan kuvia puhelimen kameralla. Sovellus avautuu kuvalistaan, joka on aluksi tyhjä. Yläpalkin kamerakuvaketta painamalla pyydetään lupa kameran käyttöön ja avataan kameranäkymä. Kun käyttäjä painaa "Ota kuva" -painiketta, sovellus palaa listaan, ja otettu kuva näkyy listan ensimmäisenä korttina kuvaushetken kanssa.

## Sisällysluettelo

- [1 Kamerakirjasto ja käyttölupa](#1-kamerakirjasto-ja-käyttölupa)
  - [1.1 Kirjaston asentaminen ja app.json](#11-kirjaston-asentaminen-ja-appjson)
  - [1.2 Käyttöluvan pyytäminen](#12-käyttöluvan-pyytäminen)
- [2 Sovelluksen tila ja kaksi näkymää](#2-sovelluksen-tila-ja-kaksi-näkymää)
- [3 Kameranäkymä](#3-kameranäkymä)
  - [3.1 CameraView ja painikkeet](#31-cameraview-ja-painikkeet)
  - [3.2 Kuvan ottaminen](#32-kuvan-ottaminen)
- [4 Otettujen kuvien lista](#4-otettujen-kuvien-lista)
- [5 Sovelluksen testaaminen](#5-sovelluksen-testaaminen)

**Projektin asentaminen ja käynnistäminen**

Demo on luotu samasta Expo SDK 57:n `blank-typescript`-mallipohjasta kuin [demo 4](../demo-04/README.md), ja se on versiolukittu `package.json`- ja `package-lock.json`-tiedostoissa määritettyihin riippuvuusversioihin. Tässäkään demossa ei ole `.nvmrc`-tiedostoa eikä `engines`-kenttää.

Asenna riippuvuudet ja käynnistä kehityspalvelin samoilla komennoilla kuin demossa 4:

```bash
npm ci
npx expo start
```

`npm ci`:n ja `npm install`:n ero on selitetty [demon 4 README:n](../demo-04/README.md) alussa. Expo Gon käyttö ja muut käynnistystavat ovat demon 4 luvussa [2.2](../demo-04/README.md#22-sovelluksen-käynnistäminen-expo-gossa).

Käyttöliittymä on rakennettu React Native Paper -kirjastolla samoin kuin demossa 5. Paperin ja sen kuvakkeiden asennus on käyty läpi demon 5 luvussa [1.1](../demo-05/README.md#11-kirjaston-ja-kuvakkeiden-asentaminen). `PaperProvider`-komponentin kiinteä vaalea teema on selitetty luvussa [1.2](../demo-05/README.md#12-paperprovider-ja-teema), ja yläpalkki `Appbar` luvussa [1.3](../demo-05/README.md#13-appbar-yläpalkki). Tässä README:ssä käydään läpi vain demon uudet asiat.

## 1 Kamerakirjasto ja käyttölupa

Demon 5 laitetiedot voitiin lukea ilman käyttäjän lupaa. Kameran käyttöön tarvitaan käyttäjän lupa, joten ennen kameranäkymää sovelluksessa pyydetään lupa puhelimen lupaikkunalla.

### 1.1 Kirjaston asentaminen ja app.json

Kamera otetaan käyttöön Expo SDK:n `expo-camera`-kirjastolla, joka asennetaan komennolla

```bash
npx expo install expo-camera
```

`npx expo install` lisää kirjaston config pluginin `app.json`-tiedoston `plugins`-kenttään. Demossa pluginille on lisäksi annettu asetuksia:

```json
[
  "expo-camera",
  {
    "cameraPermission": "Sovellus käyttää kameraa kuvien ottamiseen.",
    "microphonePermission": false,
    "recordAudioAndroid": false
  }
]
```

Asetukset:

- `cameraPermission`: teksti, joka näytetään iOS:n lupaikkunassa kameran käyttölupaa pyydettäessä.
- `microphonePermission`: arvolla `false` iOS-sovellukseen ei lisätä mikrofonin käyttölupaa. Demossa kuvataan vain valokuvia, joten mikrofonia ei tarvita.
- `recordAudioAndroid`: arvolla `false` Android-sovellukseen ei lisätä äänen tallennuksen `RECORD_AUDIO`-lupaa.

Kuten demon 5 luvussa [1.1](../demo-05/README.md#11-kirjaston-ja-kuvakkeiden-asentaminen) todettiin, config pluginit vaikuttavat vain natiivisovellukseksi käännettyyn versioon. Expo Gossa kameran käyttölupa pyydetään Expo Go -sovellukselle, eikä demon omaa lupatekstiä näytetä.

### 1.2 Käyttöluvan pyytäminen

Kameran käyttölupaa käsitellään `useCameraPermissions`-hookilla:

```tsx
const [kameraLupa, pyydaKameraLupa] = useCameraPermissions();
```

Hook palauttaa taulukon, josta puretaan kaksi ensimmäistä arvoa:

- `kameraLupa`: luvan nykyinen tila. Arvo on `null`, kunnes luvan tila on luettu puhelimesta. Sen jälkeen `kameraLupa.granted` on `true`, jos lupa on annettu.
- `pyydaKameraLupa`: funktio, joka avaa puhelimen lupaikkunan. Funktio palauttaa lupaikkunan jälkeisen tilan.

Lupaa pyydetään, kun käyttäjä painaa yläpalkin kamerakuvaketta:

```tsx
const kaynnistaKamera = async () => {
    const lupa = kameraLupa?.granted ? kameraLupa : await pyydaKameraLupa();
    setKameraValmis(false);
    setKuvaustiedot((edellinen) => ({
        ...edellinen,
        kuvaustila: lupa.granted,
        virhe: (!lupa.granted) ? "Ei lupaa kameran käyttöön." : ""
    }));
}
```

Jos lupa on jo annettu, käytetään `kameraLupa`-arvoa suoraan. Muuten kutsutaan `pyydaKameraLupa()`-funktiota ja odotetaan käyttäjän vastausta. `?.`-operaattori tarvitaan, koska `kameraLupa` voi olla vielä `null`. Luvan perusteella kameranäkymä joko avataan tai käyttäjälle näytetään virheilmoitus. Muuttujat `kameraValmis` ja `kuvaustiedot` esitellään luvussa 2.

> [!TIP]
>
> Jos käyttäjä kieltää luvan, lupaikkunaa ei välttämättä näytetä enää uudelleen. Luvan voi silloin antaa puhelimen asetuksista. Expo Gossa lupa annetaan Expo Go -sovelluksen asetuksista.

## 2 Sovelluksen tila ja kaksi näkymää

Nyt kameran käyttölupa on käsitelty. Seuraavaksi käydään läpi sovelluksen tila, jonka perusteella näytetään joko kuvalista tai kameranäkymä.

```tsx
interface Kuvaustiedot {
    kuvaustila: boolean;
    virhe: string;
    info: string;
}

interface OtettuKuva {
    uri: string;
    aikaleima: Date;
}
```

```tsx
const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
    kuvaustila: false,
    virhe: "",
    info: ""
});
const [kameraValmis, setKameraValmis] = useState<boolean>(false);
const [kuvat, setKuvat] = useState<OtettuKuva[]>([]);
```

Tilamuuttujat:

- `kuvaustiedot`: olio, jossa on kolme kenttää. `kuvaustila` määrittää, onko kameranäkymä auki. `virhe` on teksti, joka näytetään, jos lupaa ei saatu. `info` on kuvaamisen aikana näytettävä teksti.
- `kameraValmis`: tieto siitä, onko kameran esikatselu käynnistynyt. Tätä käytetään luvussa 3.1.
- `kuvat`: otettujen kuvien taulukko. Jokaisesta kuvasta tallennetaan kuvatiedoston osoite `uri` ja kuvaushetki `aikaleima`.

Näkymä valitaan `kuvaustila`-kentän perusteella:

```tsx
return (
    <PaperProvider theme={MD3LightTheme}>
        {!kuvaustiedot.kuvaustila ? aloitusNakyma() : kameraNakyma()}
    </PaperProvider>
);
```

`aloitusNakyma` ja `kameraNakyma` ovat `App`-komponentin sisällä määriteltyjä funktioita, jotka palauttavat JSX:ää. Kerrallaan renderöidään vain toinen näkymistä. Kun kameranäkymä suljetaan, kamerakomponentti poistetaan näkymästä ja kameran esikatselu pysähtyy. Expon dokumentaation mukaan kerrallaan voi olla käynnissä vain yksi kameran esikatselu, joten kamerakomponenttia ei pidetä näkyvissä turhaan.

`kuvaustiedot`-oliota päivitetään demossa päivitysfunktiolla, esimerkiksi kameranäkymän "Sulje"-painikkeessa:

```tsx
onPress={() => setKuvaustiedot((edellinen) => ({ ...edellinen, kuvaustila: false }))}
```

Päivitysfunktio saa parametrina tilan viimeisimmän arvon, ja se palauttaa uuden arvon. Tätä tapaa käytetään aina, kun uusi tila lasketaan edellisestä. Se on erityisen tärkeä `async`-funktioissa. `await`-kohdan jälkeen `kuvaustiedot`-muuttujassa on yhä se arvo, joka oli voimassa funktion käynnistyessä, ja tila on voinut muuttua sen jälkeen. Nuolifunktion palauttama olio kirjoitetaan sulkeisiin `({ ... })`, jotta aaltosulkeet tulkitaan olioksi funktion rungon sijaan.

## 3 Kameranäkymä

Kun lupa on saatu ja `kuvaustila` on `true`, näytetään kameranäkymä. Siinä on koko näytön kokoinen kameran esikatselu ja sen päällä kaksi painiketta.

### 3.1 CameraView ja painikkeet

```tsx
const kameraNakyma = () => {
    return (
        <View style={styles.kuvaustila}>

            <CameraView
                style={StyleSheet.absoluteFill}
                ref={kameraRef}
                onCameraReady={() => setKameraValmis(true)}
            />

            {(Boolean(kuvaustiedot.info))
                ? <Text style={{ color: "#fff" }}>{kuvaustiedot.info}</Text>
                : null
            }

            <SafeAreaView style={styles.kameranPainikkeet} edges={['bottom']}>

                <FAB
                    style={styles.nappi}
                    icon="close"
                    label="Sulje"
                    onPress={() => setKuvaustiedot((edellinen) => ({ ...edellinen, kuvaustila: false }))}
                />

                <FAB
                    style={styles.nappi}
                    icon="camera"
                    label="Ota kuva"
                    disabled={!kameraValmis}
                    onPress={otaKuva}
                />

            </SafeAreaView>

            <StatusBar style="light" />

        </View>
    );
}
```

`CameraView` näyttää kameran esikatselukuvan. `StyleSheet.absoluteFill` on React Nativen valmis tyyli, joka venyttää komponentin koko ylemmän komponentin kokoiseksi absoluuttisella sijoittelulla. Esikatselu täyttää siis koko näytön.

Teksti ja painikkeet kirjoitetaan `CameraView`-komponentin jälkeen samalle tasolle sen kanssa. React Native piirtää myöhemmin kirjoitetut komponentit aiempien päälle, joten ne näkyvät esikatselukuvan päällä.

> [!WARNING]
>
> `CameraView`-komponentin sisään ei kirjoiteta muita komponentteja. Kirjasto tulostaa silloin konsoliin varoituksen "The `<CameraView>` component does not support children", koska lapsikomponentit voivat aiheuttaa virheellistä toimintaa tai sovelluksen kaatumisen. Vanhemmissa netin ohjeissa painikkeet on usein kirjoitettu kamerakomponentin sisään.

Painikkeet ovat Paperin `FAB`-komponentteja. FAB eli floating action button on näkymän päätoiminnon pyöristetty painike, jolle annetaan kuvake `icon`-propsilla ja teksti `label`-propsilla. Painikkeet on koottu `SafeAreaView`-komponentin sisään, joka on sijoitettu absoluuttisesti näytön alareunaan. `edges={['bottom']}` lisää alareunaan Androidin navigointipalkin korkuisen tyhjän tilan, jotta painikkeet eivät jää navigointipalkin alle. `SafeAreaView` esiteltiin demon 4 luvussa [4.2](../demo-04/README.md#42-safeareaview-ja-otsikot).

"Ota kuva" -painike on pois käytöstä, kunnes kamera on valmis. Kun esikatselu on käynnistynyt, `CameraView` kutsuu `onCameraReady`-käsittelijää, joka asettaa `kameraValmis`-tilan arvoksi `true`. Expon dokumentaation mukaan kuvaa ei saa ottaa ennen tätä. `kaynnistaKamera`-funktiossa `kameraValmis` palautetaan arvoon `false` joka kerta, kun kamera avataan uudelleen.

Kameranäkymässä tilapalkin tyyliksi asetetaan `"light"`, jotta tilapalkin kuvakkeet erottuvat tummasta kamerakuvasta. Kuvalistassa tyyli on `"dark"` samoin kuin demossa 5.

### 3.2 Kuvan ottaminen

Kuvan ottamiseen tarvitaan viittaus `CameraView`-komponenttiin, koska kuva otetaan komponentin omalla `takePictureAsync()`-metodilla. Viittaus luodaan `useRef`-hookilla ja liitetään komponenttiin `ref`-propsilla, kuten luvun 3.1 koodissa:

```tsx
const kameraRef = useRef<CameraView>(null);
```

`useRef` luo olion, jonka `current`-kenttään React asettaa komponentin, kun se on renderöity. Ennen sitä arvo on `null`. Tyyppiparametrilla `<CameraView>` määritetään, että `current`-kentässä on kamerakomponentti tai `null`, jolloin sen metodeja voi kutsua.

> [!NOTE]
>
> Demon 4 luvussa [4.3](../demo-04/README.md#43-tekstikenttä-ja-tilamuuttuja) tekstikentän arvo tallennettiin tilamuuttujaan. Tilamuuttuja on oikea valinta arvoille, jotka näytetään käyttöliittymässä. `useRef` on oikea valinta, kun komponentin omaa metodia pitää kutsua koodista, kuten tässä `takePictureAsync()`-metodia.

Kuva otetaan `otaKuva`-funktiossa, joka suoritetaan "Ota kuva" -painiketta painettaessa:

```tsx
const otaKuva = async () => {

    setKuvaustiedot((edellinen) => ({
        ...edellinen,
        info: "Odota hetki..."
    }));

    const kuva: CameraCapturedPicture = await kameraRef.current!.takePictureAsync();

    setKuvat((edelliset) => [{ uri: kuva.uri, aikaleima: new Date() }, ...edelliset]);
    setKuvaustiedot((edellinen) => ({
        ...edellinen,
        kuvaustila: false,
        info: ""
    }));

}
```

Funktio etenee näin:

1. Esikatselun päälle tulee teksti "Odota hetki...", koska kuvan käsittely kestää hetken.
2. `takePictureAsync()` ottaa kuvan ja tallentaa sen tiedostoksi. Palautetun `CameraCapturedPicture`-olion `uri`-kentässä on kuvatiedoston osoite.
3. Uusi kuva lisätään `kuvat`-taulukon alkuun, jolloin uusin kuva näkyy listassa ensimmäisenä.
4. Kameranäkymä suljetaan, ja teksti poistetaan.

`kameraRef.current!`-lausekkeen `!`-merkki poistaa tyypistä `null`-vaihtoehdon. Sitä voi käyttää tässä turvallisesti, koska "Ota kuva" -painike on näkyvissä vain silloin, kun kamerakomponentti on renderöity.

> [!NOTE]
>
> `takePictureAsync()` tallentaa kuvan sovelluksen välimuistikansioon, josta puhelin voi poistaa tiedostoja. Demossa kuvien tiedot ovat vain `kuvat`-tilamuuttujassa, joten lista tyhjenee, kun sovellus suljetaan. Kuvien pysyvä tallentaminen vaatisi niiden kopioimisen toiseen kansioon esimerkiksi `expo-file-system`-kirjastolla, jota tässä demossa ei käytetä.

## 4 Otettujen kuvien lista

Otetut kuvat näytetään aloitusnäkymässä yläpalkin alla:

```tsx
<FlatList
    data={kuvat}
    keyExtractor={(kuva) => kuva.uri}
    contentContainerStyle={styles.lista}
    ListEmptyComponent={
        <Text style={styles.tyhjaLista}>Ei otettuja kuvia.</Text>
    }
    renderItem={({ item }) => (
        <Card style={styles.kortti}>
            <Image
                source={{ uri: item.uri }}
                style={styles.korttiKuva}
                resizeMode="contain"
            />
            <Card.Content>
                <Text variant="bodySmall" style={styles.aikaleima}>
                    {item.aikaleima.toLocaleString('fi-FI')}
                </Text>
            </Card.Content>
        </Card>
    )}
/>
```

`FlatList` on React Nativen listakomponentti, joka renderöi vain näytöllä näkyvät ja pian näkyviin tulevat rivit. Pitkästäkin kuvalistasta renderöidään kerralla vain muutama kuva, mikä säästää puhelimen muistia. `FlatList`-komponentille annetaan nämä propsit:

- `data`: listan taulukko, tässä `kuvat`-tilamuuttuja.
- `renderItem`: funktio, joka palauttaa yhden rivin JSX:n. Rivin tiedot ovat parametrin `item`-kentässä.
- `keyExtractor`: funktio, joka palauttaa rivin yksilöivän avaimen. Avain vastaa web-Reactin `key`-attribuuttia.
- `ListEmptyComponent`: komponentti, joka näytetään, kun taulukko on tyhjä.
- `contentContainerStyle`: listan sisällön tyyli, tässä sisennys reunoilta.

Avaimena käytetään kuvatiedoston osoitetta, koska se on jokaisella kuvalla eri ja pysyy samana. Uudet kuvat lisätään listan alkuun, joten taulukon indeksiä käytettäessä jokaisen vanhan kuvan avain muuttuisi.

Jokainen kuva näytetään Paperin `Card`-komponentissa. Kuva on React Nativen `Image`-komponentti, jonka `source`-propsiksi annetaan kuvatiedoston osoite. `korttiKuva`-tyylissä leveys on koko kortin levyinen ja kuvasuhde 3:4. `resizeMode="contain"` sovittaa koko kuvan näkyviin rajaamatta sitä. Kuvan alle tulee `Card.Content`-komponenttiin kuvaushetki, joka muotoillaan suomalaiseen muotoon `toLocaleString('fi-FI')`-metodilla.

Jos kameran käyttölupaa ei saatu, yläpalkin alle tulostetaan `virhe`-teksti samalla ehdollisella tulostuksella kuin demoissa 4 ja 5:

```tsx
{(Boolean(kuvaustiedot.virhe))
    ? <Text style={styles.virhe}>{kuvaustiedot.virhe}</Text>
    : null
}
```

Valmis komponentti on kokonaisuudessaan tiedostossa [App.tsx](./App.tsx).

## 5 Sovelluksen testaaminen

Sovellus on nyt valmis. Sitä testataan puhelimessa näin:

1. Käynnistä kehityspalvelin ja avaa sovellus Expo Gossa samoin kuin demossa 4. Listassa näkyy teksti "Ei otettuja kuvia.".
2. Paina yläpalkin kamerakuvaketta ja anna lupa kameran käyttöön.
3. Odota, että "Ota kuva" -painike tulee käyttöön, ja paina sitä. Sovellus palaa listaan, ja otettu kuva näkyy listan ensimmäisenä.
4. Ota toinen kuva. Uusi kuva näkyy listassa ylimpänä.
5. Avaa kamera uudelleen ja paina "Sulje". Sovellus palaa listaan ilman uutta kuvaa.

Luvan kieltämistä voi testata poistamalla Expo Gon kameraluvan puhelimen asetuksista ja kieltämällä luvan lupaikkunassa. Yläpalkin alle tulee silloin teksti "Ei lupaa kameran käyttöön.". Android-emulaattorissa kamerana toimii emulaattorin virtuaalinen kamera. Kehityspalvelin pysäytetään `Ctrl+C`:llä kuten demossa 4.

Seuraavassa demossa tiedot tallennetaan puhelimeen SQLite-tietokantaan `expo-sqlite`-kirjastolla.
