# Sijaintitietojen käyttö Expo-sovelluksessa (SDK 57)

Laitteen sijainti luetaan Expo SDK:n `expo-location`-kirjastolla. Kirjasto toimii Androidilla, iOS:llä ja webissä, ja se sisältyy Expo Goon, joten sen kokeilemiseen ei tarvita omaa development buildia. Poikkeus on taustasijainti, josta lisää lopussa.

Lähde: [Expo Location, SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/location/)

## 1 Asennus ja asetukset

```bash
npx expo install expo-location
```

Androidilla kirjasto lisää sovellukseen automaattisesti oikeudet `ACCESS_COARSE_LOCATION` (likimääräinen sijainti) ja `ACCESS_FINE_LOCATION` (tarkka sijainti). iOS:llä lupakyselyssä näytettävä selitysteksti annetaan `app.json`-tiedoston config pluginissa:

```json
"plugins": [
    [
        "expo-location",
        {
            "locationWhenInUsePermission": "Sovellus käyttää sijaintiasi näyttääkseen lähimmät kohteet."
        }
    ]
]
```

Expo Gossa lupakyselyssä näkyy Expo Gon oma teksti, koska sovellus toimii Expo Gon sisällä. Pluginin tekstit tulevat käyttöön vasta omassa buildissa, mutta ne kannattaa kirjoittaa valmiiksi.

## 2 Luvan pyytäminen

Sijaintia ei voi lukea, ennen kuin käyttäjä on antanut siihen luvan. Lupaa pyydetään funktiolla `requestForegroundPermissionsAsync`. Se näyttää käyttöjärjestelmän lupaikkunan, jos käyttäjä ei ole vielä vastannut siihen:

```tsx
import * as Location from 'expo-location';
import { Linking } from 'react-native';

const lupa = await Location.requestForegroundPermissionsAsync();

if (!lupa.granted) {
    if (!lupa.canAskAgain) {
        // Käyttäjä on kieltänyt luvan pysyvästi, joten lupaikkuna ei enää aukea.
        // Luvan voi antaa vain laitteen asetuksista.
        await Linking.openSettings();
    }
    return;
}
```

Palautetun `LocationPermissionResponse`-olion kentät:

| Kenttä | Merkitys |
|---|---|
| `status` | `'granted'`, `'denied'` tai `'undetermined'` (käyttäjä ei ole vielä vastannut) |
| `granted` | `true`, jos lupa on annettu |
| `canAskAgain` | `false`, jos lupaikkunaa ei voi enää näyttää |
| `android.accuracy` | `'fine'` tai `'coarse'`: antoiko käyttäjä tarkan vai likimääräisen sijainnin |
| `ios.scope` | `'whenInUse'`, `'always'` tai `'none'` |

Luvan tilan voi tarkistaa kysymättä sitä funktiolla `getForegroundPermissionsAsync`. Komponentin sisällä voi käyttää myös hookia `const [lupa, pyydaLupaa] = Location.useForegroundPermissions();`.

Käyttäjä voi antaa luvan pelkkään likimääräiseen sijaintiin (Androidilla *Approximate*, iOS:llä *Precise*-valinta pois päältä). Silloin sovellus saa sijainnin, mutta se on vain muutaman kilometrin tarkkuudella.

## 3 Sijainnin hakeminen

Nykyinen sijainti haetaan kerran funktiolla `getCurrentPositionAsync`:

```tsx
const sijainti = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

console.log(sijainti.coords.latitude, sijainti.coords.longitude);
```

Haku voi kestää useita sekunteja, varsinkin sisätiloissa. Jos nopeus on tärkeämpää kuin tuoreus, `getLastKnownPositionAsync` palauttaa laitteen viimeisimmän tunnetun sijainnin heti. Se palauttaa `null`, jos sijaintia ei ole tai se ei täytä annettuja ehtoja:

```tsx
const viimeisin = await Location.getLastKnownPositionAsync({ maxAge: 60000, requiredAccuracy: 100 });
```

Kirjastossa on tarkkuustasot `Accuracy.Lowest`, `Low`, `Balanced`, `High`, `Highest` ja `BestForNavigation`. Oletus on `Balanced`, joka on noin 100 metrin tarkkuudella. `High` on noin 10 metrin tarkkuudella. Mitä tarkempi taso, sitä enemmän haku kuluttaa akkua.

Palautetun `LocationObject`-olion tärkeimmät kentät:

| Kenttä | Merkitys |
|---|---|
| `coords.latitude`, `coords.longitude` | Leveys- ja pituusaste desimaaliasteina |
| `coords.accuracy` | Epätarkkuussäde metreinä |
| `coords.altitude`, `coords.speed`, `coords.heading` | Korkeus (m), nopeus (m/s) ja kulkusuunta (astetta pohjoisesta). Voivat olla `null`. |
| `timestamp` | Sijainnin aikaleima millisekunteina |

`getCurrentPositionAsync` heittää virheen esimerkiksi silloin, kun sijaintipalvelut on kytketty laitteesta pois päältä. Siksi haku kannattaa kirjoittaa `try`/`catch`-lohkoon. Palveluiden tilan voi tarkistaa etukäteen funktiolla `hasServicesEnabledAsync()`.

Sijainnin hakeva ja näyttävä komponentti kokonaisuudessaan:

```tsx
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

function Sijainti() {

    const [sijainti, setSijainti] = useState<Location.LocationObject | null>(null);
    const [virhe, setVirhe] = useState<string>('');

    useEffect(() => {

        const haeSijainti = async (): Promise<void> => {

            const lupa = await Location.requestForegroundPermissionsAsync();

            if (!lupa.granted) {
                setVirhe('Sijaintilupaa ei annettu');
                return;
            }

            try {
                setSijainti(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }));
            } catch {
                setVirhe('Sijaintia ei saatu. Onko sijaintipalvelu päällä?');
            }
        };

        haeSijainti();

    }, []);

    if (virhe) return <Text>{virhe}</Text>;
    if (!sijainti) return <Text>Haetaan sijaintia...</Text>;

    return <Text>{sijainti.coords.latitude.toFixed(5)}, {sijainti.coords.longitude.toFixed(5)}</Text>;
}
```

## 4 Sijainnin seuraaminen

`watchPositionAsync` kutsuu annettua funktiota aina, kun sijainti muuttuu. Päivityksiä tulee vain silloin, kun sovellus on etualalla. Funktio palauttaa tilauksen (`LocationSubscription`). Kun komponentti poistetaan, tilaus on lopetettava sen `remove()`-metodilla, muuten seuranta jatkuu, vaikka komponenttia ei enää näytetä:

```tsx
useEffect(() => {

    let tilaus: Location.LocationSubscription | null = null;
    let peruttu = false;

    const aloitaSeuranta = async (): Promise<void> => {

        const lupa = await Location.requestForegroundPermissionsAsync();
        if (!lupa.granted) return;

        const uusiTilaus = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (uusiSijainti) => setSijainti(uusiSijainti),
            (virheviesti) => console.log(virheviesti)
        );

        // Jos komponentti poistettiin odotuksen aikana, tilaus lopetetaan heti
        if (peruttu) {
            uusiTilaus.remove();
        } else {
            tilaus = uusiTilaus;
        }
    };

    aloitaSeuranta();

    return () => {
        peruttu = true;
        tilaus?.remove();
    };

}, []);
```

`distanceInterval: 10` tarkoittaa, että uusi sijainti tulee vasta, kun laite on liikkunut vähintään 10 metriä. Androidilla päivitysväliä voi rajata myös ajan mukaan `timeInterval`-asetuksella (millisekunteina).

## 5 Sijainnin käyttäminen

**Osoite koordinaateista.** `reverseGeocodeAsync` muuttaa koordinaatit osoitteeksi, ja `geocodeAsync` tekee saman toisin päin. Molemmat toimivat vain Androidilla ja iOS:llä, eivät webissä. Androidilla sijaintilupa on pyydettävä ennen kuin niitä voi käyttää.

```tsx
const osoitteet = await Location.reverseGeocodeAsync({
    latitude: sijainti.coords.latitude,
    longitude: sijainti.coords.longitude
});

const osoite = osoitteet[0];
console.log(`${osoite?.street} ${osoite?.streetNumber}, ${osoite?.postalCode} ${osoite?.city}`);

const kohteet = await Location.geocodeAsync('Patteristonkatu 3, Mikkeli');
console.log(kohteet[0]?.latitude, kohteet[0]?.longitude);
```

Geokoodaus kuormittaa laitetta, ja liian monta pyyntöä kerralla voi aiheuttaa virheen. Kutsu sitä siis vain tarvittaessa, esimerkiksi painikkeesta, äläkä jokaisella `watchPositionAsync`-päivityksellä.

**Sijainti karttasovelluksessa.** Sijainnin voi avata laitteen karttasovellukseen React Nativen `Linking`-rajapinnalla:

```tsx
const { latitude, longitude } = sijainti.coords;
await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
```

## 6 Testaaminen

Kun sovellus kysyy lupaa Expo Gossa, lupa annetaan Expo Go -sovellukselle eikä omalle projektillesi. Jos kiellät luvan yhdessä projektissa, se on kielletty kaikissa Expo Gossa ajettavissa projekteissa. Luvan voi palauttaa laitteen asetuksista Expo Gon kohdalta.

### 6.1 iOS

**Fyysinen iPhone (Linux ja Windows).** iOS-simulaattori toimii vain macOS:llä, joten Linuxilla ja Windowsilla iOS-versiota testataan omalla iPhonella. Expo Go on App Storessa ilmainen, eikä se vaadi Apple Developer Program -jäsenyyttä. iOS:n Expo Go vaatii SDK 57:stä alkaen kuitenkin kirjautumisen samalle ilmaiselle [Expo-tilille](https://expo.dev/signup) sekä terminaalissa että sovelluksessa:

1. Asenna iPhoneen Expo Go App Storesta.
2. Kirjaudu Expo-tilille terminaalissa komennolla `npx expo login` ja Expo Gossa oikean yläkulman tilikuvakkeesta.
3. Käynnistä kehityspalvelin komennolla `npx expo start` ja skannaa terminaalissa näkyvä QR-koodi iPhonen kameralla. Puhelimen ja tietokoneen on oltava samassa verkossa. Jos yhteys ei toimi, kokeile komentoa `npx expo start --tunnel`.
4. Valitse lupaikkunassa *Allow While Using App* tai *Allow Once*. *Allow Once* on voimassa vain kyseisen käyttökerran ajan, joten seuraavalla kerralla lupaa kysytään uudelleen.
5. Tarkista, että sijaintipalvelut ovat päällä: *Asetukset → Tietosuoja ja turvallisuus → Sijaintipalvelut*. Samasta paikasta näet ja voit muuttaa Expo Gon sijaintiluvan.

Oikealla laitteella sijainti tulee puhelimen GPS:stä. Sisätiloissa ensimmäinen haku voi kestää, ja tarkkuus on huonompi kuin ulkona.

**iOS-simulaattori (macOS).** Valitse simulaattorin valikosta *Features → Location* jokin muu vaihtoehto kuin *None*. *Custom Location…* asettaa kiinteän pisteen, ja *City Run* tai *Freeway Drive* liikuttaa laitetta, mikä sopii `watchPositionAsync`-seurannan testaamiseen. Kiinteän sijainnin voi asettaa myös terminaalista (järjestys on leveysaste, pituusaste):

```bash
xcrun simctl location booted set 61.6886,27.2723
```

### 6.2 Android-emulaattori

1. Käynnistä emulaattori Android Studiosta ja avaa sovellus painamalla `a` terminaalissa, jossa `npx expo start` on käynnissä.
2. Avaa emulaattorissa *Settings → Location* ja kytke **Use location** päälle.
3. Aseta sijainti. Emulaattorin oletussijainti on yleensä Kaliforniassa, joten vaihda se ennen testaamista:
    - Avaa emulaattorin sivupalkista **⋯ (Extended controls) → Location**.
    - **Single points**-välilehdellä valitse kohta kartalta ja paina **Set location**.
    - **Routes**-välilehdellä voit luoda reitin ja painaa **Play route**, jolloin emulaattori liikkuu reittiä pitkin. Näin voit testata `watchPositionAsync`-seurantaa. **Playback speed** säätää nopeutta, ja **Load GPX/KML** lataa valmiin reittitiedoston.
4. Sijainnin voi asettaa myös terminaalista. **Huomaa järjestys: pituusaste ensin, sitten leveysaste.**

    ```bash
    adb emu geo fix 27.2723 61.6886
    ```

**Jos sijaintia ei tule.** Expon dokumentaation mukaan emulaattorissa voi joutua kytkemään pois Googlen tarkennetun sijainnin, jolloin sijainti tulee pelkästä GPS:stä eli emulaattorin asetuksista:

- Android 12 ja uudemmat: *Settings → Location → Location Services → Google Location Accuracy* → **Improve Location Accuracy** pois päältä.
- Android 11 ja vanhemmat: *Settings → Location → Advanced → Google Location Accuracy* pois päältä.

Tuoreessa emulaattorissa `getLastKnownPositionAsync` palauttaa usein `null`, koska laitteella ei ole vielä tallennettua sijaintia. Käytä testaamiseen `getCurrentPositionAsync`-funktiota tai aseta sijainti ensin yllä olevilla ohjeilla.

## 7 Taustasijainti

Taustasijaintia tarvitaan, jos sijaintia pitää seurata myös silloin, kun sovellus ei ole näkyvissä. Siihen käytetään funktioita `requestBackgroundPermissionsAsync`, `startLocationUpdatesAsync` ja `expo-task-manager`-kirjastoa. Taustasijainti ei toimi Expo Gossa, vaan se vaatii [development buildin](https://docs.expo.dev/develop/development-builds/introduction/). Lisäksi Google Play tarkastaa erikseen sovellukset, jotka käyttävät taustasijaintia. Tämän ohjeen etualalla toimivat funktiot riittävät useimpiin sovelluksiin.
