# Demo 5: Laitekomponentit

Viidennessä demossa rakennetaan sovellus, joka näyttää tietoja puhelimesta, jolla sitä käytetään. Näkymän yläreunassa on yläpalkki, ja sen alla on kaksi avattavaa listaa. Ensimmäisestä listasta näkee laitteen perustiedot ja toisesta akun varaustason ja lataustilan. Listojen alla olevaa painiketta painamalla puhelin värisee. Demossa otetaan käyttöön React Native Paper -komponenttikirjasto ja Expo SDK:n kirjastot, joilla puhelimen tietoja luetaan.

## Sisällysluettelo

- [1 React Native Paper](#1-react-native-paper)
  - [1.1 Kirjaston ja kuvakkeiden asentaminen](#11-kirjaston-ja-kuvakkeiden-asentaminen)
  - [1.2 PaperProvider ja teema](#12-paperprovider-ja-teema)
  - [1.3 Appbar-yläpalkki](#13-appbar-yläpalkki)
- [2 Laitteen perustiedot ja avattava lista](#2-laitteen-perustiedot-ja-avattava-lista)
- [3 Akkutiedot](#3-akkutiedot)
- [4 Värinä ja Paperin painike](#4-värinä-ja-paperin-painike)
- [5 Sovelluksen testaaminen](#5-sovelluksen-testaaminen)

**Projektin asentaminen ja käynnistäminen**

Demo on luotu samasta Expo SDK 57:n `blank-typescript`-mallipohjasta kuin [demo 4](../demo-04/README.md), ja se on versiolukittu `package.json`- ja `package-lock.json`-tiedostoissa määritettyihin riippuvuusversioihin. Tässäkään demossa ei ole `.nvmrc`-tiedostoa eikä `engines`-kenttää.

Asenna riippuvuudet ja käynnistä kehityspalvelin samoilla komennoilla kuin demossa 4:

```bash
npm ci
npx expo start
```

`npm ci`:n ja `npm install`:n ero on selitetty [demon 4 README:n](../demo-04/README.md) alussa. Expo Gon käyttö ja muut käynnistystavat ovat demon 4 luvussa [2.2](../demo-04/README.md#22-sovelluksen-käynnistäminen-expo-gossa).

## 1 React Native Paper

Demossa 4 käyttöliittymä rakennettiin React Nativen peruskomponenteilla. Niiden ulkoasu vaihtelee käyttöjärjestelmän mukaan, ja esimerkiksi `Button`-komponentin ulkoasua voi muuttaa vain `color`-propsilla. Tässä demossa käyttöliittymä rakennetaan [React Native Paper](https://oss.callstack.com/react-native-paper/ "https://oss.callstack.com/react-native-paper/") -kirjaston komponenteilla. Paperin komponentit on toteutettu Googlen Material Design -suunnittelujärjestelmän mukaisesti. Ne näyttävät samalta Androidissa ja iOS:ssä, ja niiden värit määritetään yhteisessä teemassa.

### 1.1 Kirjaston ja kuvakkeiden asentaminen

Paper ja sen tarvitsemat kirjastot asennetaan demon 4 luvussa [3.1](../demo-04/README.md#31-packagejson-ja-riippuvuudet) esitellyllä `npx expo install` -komennolla:

```bash
npx expo install react-native-paper react-native-safe-area-context @react-native-vector-icons/material-design-icons expo-font
```

Komento asentaa neljä pakettia:

- `react-native-paper`: Paperin komponentit ja teemat.
- `react-native-safe-area-context`: sama kirjasto kuin demossa 4. Paper käyttää sitä esimerkiksi yläpalkin sijoittamiseen tilapalkin alapuolelle.
- `@react-native-vector-icons/material-design-icons`: Material Design Icons -kuvakkeet, joita Paperin komponenteissa käytetään.
- `expo-font`: kirjasto, jolla kuvakkeiden fonttitiedosto ladataan sovelluksen käyttöön.

Kuvakkeet ovat yhden fonttitiedoston merkkejä. Kuvakekirjastoa ei tuoda `App.tsx`-tiedostoon, koska se otetaan käyttöön Paperin sisällä automaattisesti, kun kirjasto on asennettu projektiin. Paperin komponenteille kuvake annetaan nimenä, esimerkiksi `icon="battery"`. Kaikkien kuvakkeiden nimet löytyvät [Material Design Icons](https://pictogrammers.com/library/mdi/ "https://pictogrammers.com/library/mdi/") -sivustolta, jossa kuvakkeita voi hakea nimellä.

> [!WARNING]
>
> Paperin asennusohjeen mukaan Expo-projekteihin ei tarvitse asentaa erillistä kuvakekirjastoa. Ohje on vanhentunut, koska Expo SDK 57:ssä `expo`-paketin mukana ei enää tule `@expo/vector-icons`-kirjastoa. Expon [dokumentaation](https://docs.expo.dev/guides/icons/ "https://docs.expo.dev/guides/icons/") mukaan `@expo/vector-icons` poistetaan käytöstä, ja tilalle suositellaan `@react-native-vector-icons`-kirjastoja. Ilman kuvakekirjastoa Paperin kuvakkeiden tilalla näkyy neliö, ja konsoliin tulostuu varoitus.

`npx expo install` lisäsi `app.json`-tiedostoon myös `plugins`-kentän:

```json
"plugins": [
  "@react-native-vector-icons/material-design-icons",
  "expo-font"
]
```

Expon config plugineilla muokataan Android- ja iOS-projektien asetuksia, kun sovellus käännetään natiivisovellukseksi. Expo Gossa niillä ei ole vaikutusta, koska Expo Go on valmiiksi käännetty sovellus. `npx expo install` lisää config pluginin automaattisesti niille kirjastoille, joissa sellainen on.

### 1.2 PaperProvider ja teema

Paperin ohjeiden mukaan sovelluksen juurikomponentti kääritään `PaperProvider`-komponenttiin. Paperin komponentit tuodaan `react-native-paper`-kirjastosta:

```tsx
import { Appbar, Button, List, MD3LightTheme, PaperProvider } from 'react-native-paper';
```

```tsx
<PaperProvider theme={MD3LightTheme}>
    <Appbar.Header>
        ...
    </Appbar.Header>
    <View style={{ marginHorizontal: 10 }}>
        ...
    </View>
</PaperProvider>
```

`PaperProvider` välittää teeman kaikille sen sisällä oleville Paperin komponenteille. Lisäksi se sisältää `react-native-safe-area-context`-kirjaston tarvitseman `SafeAreaProvider`-komponentin, joten sitä ei tarvitse lisätä erikseen.

`theme`-propsilla valitaan sovelluksen teema. `MD3LightTheme` on Paperin valmis vaalea teema, joka on tehty Material Design 3 -ohjeiston mukaan. Jos `theme`-props jätetään pois, teema valitaan puhelimen tumman tai vaalean tilan mukaan. Tumman teeman tekstit ovat vaaleita, mutta demon tausta on valkoinen, jolloin tekstit näkyvät hyvin haaleina. Kiinteä vaalea teema vastaa `app.json`-tiedoston asetusta `"userInterfaceStyle": "light"`.

Samasta syystä tilapalkin tyyliksi on asetettu `"dark"`:

```tsx
<StatusBar style="dark" />
```

Arvolla `"dark"` tilapalkin kuvakkeet ovat aina tummia, joten ne erottuvat vaaleasta yläpalkista. Demon 4 arvolla `"auto"` kuvakkeet muuttuisivat puhelimen tummassa tilassa vaaleiksi.

### 1.3 Appbar-yläpalkki

Nyt sovelluksen teema on määritetty, ja näkymän yläreunaan lisätään yläpalkki:

```tsx
<Appbar.Header>
    <Appbar.Content title="Demo 5: Laitekomponentit" />
    <Appbar.Action icon="atom" />
</Appbar.Header>
```

Paperissa toisiinsa liittyvät komponentit on koottu saman nimen alle, esimerkiksi `Appbar.Header` ja `Appbar.Content`. Sama rakenne on käytössä myös luvun 2 `List`-komponenteissa.

`Appbar.Header` on näytön yläreunaan sijoitettava yläpalkki. Se lisää yläreunaansa tilapalkin korkuisen tyhjän tilan, joten demossa 4 käytettyä `SafeAreaView`-komponenttia ei tässä tarvita. Yläpalkin sisältö kirjoitetaan sen sisään:

- `Appbar.Content`: yläpalkin otsikko, joka annetaan `title`-propsina.
- `Appbar.Action`: kuvakepainike, jonka kuvake valitaan `icon`-propsilla.

Demon `Appbar.Action`-painikkeella ei ole `onPress`-käsittelijää, joten painikkeen painaminen ei tee mitään.

## 2 Laitteen perustiedot ja avattava lista

Yläpalkin alle lisätään seuraavaksi avattava lista, jossa näytetään laitteen perustiedot. Tiedot luetaan Expo SDK:n `expo-device`-kirjastolla, joka asennetaan komennolla

```bash
npx expo install expo-device
```

Kirjasto tuodaan yhtenä oliona:

```tsx
import * as Device from 'expo-device';
```

`import * as Device` tuo kaikki kirjaston viennit `Device`-nimisen olion kenttinä. Laitteen tiedot ovat kirjastossa valmiita vakioita, joten niitä ei tarvitse hakea asynkronisesti. Vakiot näytetään `List.Accordion`-komponentin sisällä:

```tsx
<List.Accordion
    title="Perustietoja laitteesta"
    left={props => <List.Icon {...props} icon="memory" />}
>
    <List.Item title="Merkki" description={Device.brand ?? 'Ei saatavilla'} />
    <List.Item title="Malli" description={Device.modelName ?? 'Ei saatavilla'} />
    <List.Item title="Käyttöjärjestelmä" description={Device.osName ?? 'Ei saatavilla'} />
    <List.Item title="Versio" description={Device.osVersion ?? 'Ei saatavilla'} />
</List.Accordion>
```

Demossa käytetyt vakiot:

- `Device.brand`: laitteen merkki, esimerkiksi "google" tai "Apple".
- `Device.modelName`: laitteen malli, esimerkiksi "Pixel 2".
- `Device.osName`: käyttöjärjestelmän nimi, esimerkiksi "Android" tai "iOS".
- `Device.osVersion`: käyttöjärjestelmän versio.

Kaikkien vakioiden tyyppi on `string | null`. Arvo on `null`, jos tietoa ei saada selvitettyä. `??`-operaattori korvaa `null`-arvon tekstillä "Ei saatavilla", jotta `description`-propsiin tulee aina merkkijono.

Listan komponentit:

- `List.Accordion`: avattava ja suljettava lista. Otsikko annetaan `title`-propsina, ja listan rivit kirjoitetaan sen sisään.
- `List.Item`: listan rivi, jossa on otsikko `title` ja sen alla pienemmällä tekstillä kuvaus `description`.
- `List.Icon`: listan otsikon vieressä näkyvä kuvake.

Listan auki- ja kiinni-tila tallennetaan `List.Accordion`-komponentin omaan tilamuuttujaan. Siksi `App`-komponenttiin ei tarvita tilamuuttujaa listan avaamista varten.

Kuvake annetaan `left`-propsille funktiona, joka palauttaa `List.Icon`-komponentin. Paper kutsuu funktiota ja antaa sille parametrina olion, jossa ovat teeman mukainen väri ja tyyli. `{...props}` välittää nämä arvot `List.Icon`-komponentille, joten kuvake saa saman värin ja asettelun kuin listan muut osat.

## 3 Akkutiedot

Laitteen perustiedot pysyvät samoina koko ajan, mutta akun tiedot muuttuvat sovelluksen ollessa käynnissä. Toiseen listaan haetaan akun varaustaso ja lataustila `expo-battery`-kirjastolla, joka asennetaan komennolla

```bash
npx expo install expo-battery
```

Kirjasto tuodaan samalla tavalla kuin `expo-device`:

```tsx
import * as Battery from 'expo-battery';
```

Akun tiedot luetaan kirjaston hookeilla:

```tsx
const akkulataus = Battery.useBatteryLevel();
const akunTila = Battery.useBatteryState();
```

- `useBatteryLevel()`: akun varaustaso lukuna 0:n ja 1:n väliltä. Jos varaustasoa ei saada luettua, arvo on `-1`.
- `useBatteryState()`: akun tila `BatteryState`-luettelon arvona, esimerkiksi `CHARGING` tai `UNPLUGGED`.

Hookit palauttavat ensin alkuarvon, joka päivittyy, kun tieto on luettu laitteesta. Hookien sisällä akun muutoksille rekisteröidään kuuntelija. Kun varaustaso tai lataustila muuttuu, hook päivittää palauttamansa arvon, ja `App`-komponentti renderöidään uudelleen.

> [!NOTE]
>
> Akun tiedot voi lukea myös itse `useEffect`-hookissa funktioilla `getBatteryLevelAsync()` ja `addBatteryLevelListener()`. Kirjaston hookeissa on toteutettu juuri tämä rakenne, joten sitä ei tarvitse kirjoittaa itse. Expon [dokumentaation](https://docs.expo.dev/versions/v57.0.0/sdk/battery/ "https://docs.expo.dev/versions/v57.0.0/sdk/battery/") käyttöesimerkissä käytetään `useBatteryLevel()`-hookia.

Lataustila muutetaan tekstiksi ennen tulostusta:

```tsx
const latauksessa = (akunTila === Battery.BatteryState.CHARGING || akunTila === Battery.BatteryState.FULL)
    ? 'Kyllä'
    : 'Ei';
```

`latauksessa` on tavallinen vakio, joka lasketaan `akunTila`-arvosta jokaisella renderöinnillä. Sille ei tarvita omaa tilamuuttujaa, koska sen arvo saadaan aina hookin palauttamasta tilasta. Arvoksi tulee "Kyllä", kun akku latautuu tai on täynnä. Tila `FULL` on mukana ehdossa, koska täyteen ladatun puhelimen tila laturissa on `FULL`.

Tiedot tulostetaan toisen `List.Accordion`-komponentin sisään:

```tsx
<List.Item
    title="Latauksen määrä"
    description={akkulataus >= 0 ? `${(100 * akkulataus).toFixed(2)} %` : 'Ei saatavilla'}
/>
<List.Item title="Latauksessa" description={latauksessa} />
```

Varaustaso muutetaan prosenteiksi kertomalla se sadalla, ja `toFixed(2)` pyöristää luvun kahden desimaalin tarkkuuteen. Negatiivisen arvon kohdalla näytetään teksti "Ei saatavilla" samoin kuin laitteen perustiedoissa. Sama teksti näkyy hetken myös sovelluksen käynnistyessä, kun `useBatteryLevel()` palauttaa vielä alkuarvon `-1`.

## 4 Värinä ja Paperin painike

Lopuksi listojen alle lisätään painike, jolla puhelin saadaan värisemään. Painike on Paperin `Button`-komponentti, ja värinä tehdään React Nativen `Vibration`-rajapinnalla. `Vibration` tuodaan `react-native`-paketista, joten sitä ei tarvitse asentaa erikseen:

```tsx
import { View, Vibration } from 'react-native';
```

```tsx
<Button
    style={{ marginVertical: 10 }}
    mode="contained"
    onPress={() => Vibration.vibrate(2000)}
    icon="vibrate"
>Värinää!</Button>
```

Paperin `Button` eroaa demon 4 React Native -painikkeesta kolmella tavalla:

- Painikkeen teksti kirjoitetaan komponentin sisään samaan tapaan kuin webin `<button>`-elementissä. `title`-propsia ei ole.
- `mode`-propsilla valitaan painikkeen tyyli. `"contained"` on täytetty painike, ja muita vaihtoehtoja ovat esimerkiksi `"outlined"` ja `"text"`.
- Painikkeelle voi antaa `style`-propsin sekä kuvakkeen `icon`-propsilla.

Painalluksen käsittelijä annetaan `onPress`-propsina samoin kuin demossa 4. `Vibration.vibrate(2000)` värisyttää puhelinta 2000 millisekuntia eli kaksi sekuntia.

> [!NOTE]
>
> React Nativen [dokumentaation](https://reactnative.dev/docs/vibration "https://reactnative.dev/docs/vibration") mukaan iOS:ssä värinän kesto on aina noin 400 millisekuntia. `vibrate()`-funktiolle annettu kesto vaikuttaa vain Androidissa.

Valmis komponentti on kokonaisuudessaan tiedostossa [App.tsx](./App.tsx).

## 5 Sovelluksen testaaminen

Sovellus on nyt valmis. Sitä testataan puhelimessa näin:

1. Käynnistä kehityspalvelin ja avaa sovellus Expo Gossa samoin kuin demossa 4.
2. Avaa "Perustietoja laitteesta" -lista. Listassa näkyvät puhelimen perustiedot.
3. Avaa "Akkutietoja"-lista ja kytke puhelin laturiin. "Latauksessa"-rivin arvoksi vaihtuu "Kyllä" ilman sovelluksen uudelleenlatausta.
4. Paina "Värinää!"-painiketta. Puhelin värisee kaksi sekuntia.

Android-emulaattorissa akun varaustasoa ja lataustilaa voi muuttaa emulaattorin Extended controls -ikkunan Battery-kohdasta. Kehityspalvelin pysäytetään `Ctrl+C`:llä kuten demossa 4.

Seuraavassa demossa käytetään puhelimen kameraa `expo-camera`-kirjastolla.
