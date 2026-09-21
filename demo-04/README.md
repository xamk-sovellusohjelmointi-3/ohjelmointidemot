# Demo 4: React Native -perusteita

Neljännessä demossa siirrytään palvelinsovelluksista mobiilisovelluksiin. Demossa rakennetaan "Hello World" -tyyppinen sovellus, jonka avulla tutustutaan Expoon ja opetellaan käyttämään ensimmäisiä React Native -komponentteja. Sovelluksen näkymässä on otsikoiden lisäksi tekstikenttä ja painike. Kun käyttäjä kirjoittaa nimensä kenttään ja painaa "Sano heippa" -painiketta, painikkeen alle tulee henkilökohtainen tervehdys, ja tekstikenttä tyhjenee.

## Sisällysluettelo

- [1 React Native ja Expo](#1-react-native-ja-expo)
  - [1.1 Miten React Native toimii](#11-miten-react-native-toimii)
  - [1.2 Mikä Expo on](#12-mikä-expo-on)
- [2 Uuden Expo-sovelluksen luominen](#2-uuden-expo-sovelluksen-luominen)
  - [2.1 Projektin luominen TypeScript-mallipohjalla](#21-projektin-luominen-typescript-mallipohjalla)
  - [2.2 Sovelluksen käynnistäminen Expo Gossa](#22-sovelluksen-käynnistäminen-expo-gossa)
- [3 Projektin tiedostot](#3-projektin-tiedostot)
  - [3.1 package.json ja riippuvuudet](#31-packagejson-ja-riippuvuudet)
  - [3.2 index.ts](#32-indexts)
  - [3.3 app.json ja muut tiedostot](#33-appjson-ja-muut-tiedostot)
- [4 Hello World -sovelluksen rakentaminen](#4-hello-world--sovelluksen-rakentaminen)
  - [4.1 Mallipohjan App-komponentti](#41-mallipohjan-app-komponentti)
  - [4.2 SafeAreaView ja otsikot](#42-safeareaview-ja-otsikot)
  - [4.3 Tekstikenttä ja tilamuuttuja](#43-tekstikenttä-ja-tilamuuttuja)
  - [4.4 Painike ja tervehdyksen näyttäminen](#44-painike-ja-tervehdyksen-näyttäminen)
- [5 Sovelluksen testaaminen](#5-sovelluksen-testaaminen)

**Projektin asentaminen ja käynnistäminen**

Demo on rakennettu Expo SDK 57:llä, ja se on versiolukittu `package.json`- ja `package-lock.json`-tiedostoissa määritettyihin riippuvuusversioihin. Demo on tehty Node 24 -versiolla kuten aiemmatkin demot. Tässä demossa ei ole `.nvmrc`-tiedostoa eikä `package.json`-tiedoston `engines`-kenttää. React Native 0.86:n vähimmäisvaatimus on Node 20.19.4.

Asenna riippuvuudet demon kansiossa komennolla

```bash
npm ci
```

`npm ci` poistaa `node_modules`-kansion ja asentaa täsmälleen `package-lock.json`-tiedostossa määritetyt versiot. `npm install` voi päivittää riippuvuuksia `package.json`-tiedoston sallimissa rajoissa. `npm ci` takaa siis, että jokainen ajaa demoa samoilla riippuvuusversioilla.

Käynnistä sen jälkeen kehityspalvelin komennolla

```bash
npx expo start
```

ja skannaa terminaaliin tuleva QR-koodi puhelimen Expo Go -sovelluksella. Expo Gon asentaminen ja muut käynnistystavat käydään läpi luvussa [2.2](#22-sovelluksen-käynnistäminen-expo-gossa).

## 1 React Native ja Expo

Kolmessa ensimmäisessä demossa rakennettiin palvelinsovelluksia, joiden käyttöliittymä näytettiin selaimessa. Tästä demosta alkaen rakennetaan mobiilisovelluksia React Nativella ja Expolla. Ennen ensimmäistä sovellusta käydään lyhyesti läpi, miten nämä kaksi toimivat yhdessä.

### 1.1 Miten React Native toimii

React Native -sovellus kirjoitetaan React-komponentteina samaan tapaan kuin web-sovellus. Tilamuuttujat, hookit ja JSX-syntaksi toimivat samoin kuin edellisen opintojakson React-demoissa. Ero on siinä, mihin komponentit lopulta piirretään.

Web-Reactissa komponenteista muodostetaan HTML-elementtejä selaimen sivulle. React Nativessa jokainen peruskomponentti vastaa jotakin puhelimen käyttöjärjestelmän omaa käyttöliittymäelementtiä. Esimerkiksi `TextInput`-komponentti näkyy Androidissa Androidin omana tekstikenttänä ja iPhonessa iOS:n omana tekstikenttänä. Sovelluksen JavaScript-koodi suoritetaan puhelimessa, ja React Native välittää käyttöliittymän muutokset käyttöjärjestelmän elementeille.

Käytännössä React-koodin kirjoittaminen muuttuu kolmella tavalla:

- HTML-elementtejä ei ole käytössä. Niiden tilalla käytetään React Nativen omia komponentteja.
- CSS-tiedostoja ei ole. Tyylit kirjoitetaan JavaScript-olioina, ja asettelu tehdään Flexboxilla.
- Kaikki näytölle tulostettava teksti kirjoitetaan `Text`-komponentin sisään.

Tässä demossa käytetyt komponentit ja niiden lähin vastine webissä:

| React Native | Lähin vastine webissä | Käyttötarkoitus |
|---|---|---|
| `View` | `<div>` | Säiliö muille komponenteille |
| `Text` | `<p>`, `<h1>` | Kaikki näytölle tulostettava teksti |
| `TextInput` | `<input type="text">` | Tekstikenttä |
| `Button` | `<button>` | Painike |
| `SafeAreaView` | ei vastinetta | Säiliö, jonka sisältö siirretään pois tilapalkin ja näytön lovien alta |

Kaikki React Nativen komponentit on lueteltu dokumentaation [Core Components and APIs](https://reactnative.dev/docs/components-and-apis "https://reactnative.dev/docs/components-and-apis") -sivulla.

### 1.2 Mikä Expo on

Expo on React Nativen päälle rakennettu sovelluskehys, johon kuuluu myös joukko kehitystyökaluja. React Nativen dokumentaatiossa uusien sovellusten tekemiseen suositellaan sovelluskehystä, ja suositeltu vaihtoehto on Expo. Tässä demossa käytetään Expon kolmea osaa:

- Expo CLI: komentorivityökalu, jota käytetään `npx expo` -komennoilla. Sillä käynnistetään kehityspalvelin, joka kokoaa sovelluksen koodin Metro-työkalulla ja lähettää sen puhelimeen.
- Expo Go: puhelimeen asennettava sovellus, jossa React Nativen ja Expon kirjastojen natiivikoodi on valmiina. Expo Go lataa oman sovelluksen JavaScript-koodin kehityspalvelimelta, joten sovellusta ei tarvitse kääntää Android- tai iOS-sovellukseksi kehityksen aikana.
- Expo SDK: kokoelma kirjastoja, joilla käytetään puhelimen ominaisuuksia, esimerkiksi kameraa tai akun tietoja. Tässä demossa SDK:sta käytetään vain `expo-status-bar`-kirjastoa, ja seuraavissa demoissa kirjastoja tulee lisää.

Kehityksen aikana sovellusta ajetaan näin:

1. `npx expo start` käynnistää kehityspalvelimen tietokoneella.
2. Puhelimen Expo Go ottaa yhteyden kehityspalvelimeen ja lataa sovelluksen koodin.
3. Kun tiedosto tallennetaan, muutos päivittyy puhelimeen automaattisesti ilman sovelluksen uudelleenkäynnistystä. Ominaisuuden nimi on Fast Refresh.

Expo SDK:lla on versionumero, joka on tässä demossa 57. Jokainen SDK-versio on sidottu tiettyihin React Nativen ja Reactin versioihin. SDK 57:ssä käytetään React Nativen versiota 0.86 ja Reactin versiota 19.2.

> [!WARNING]
>
> Expo Go tukee vain uusinta SDK-versiota, joka on syyskuussa 2026 SDK 57. Kun Expo julkaisee seuraavan SDK-version ja Expo Go päivittyy, tämän demon avaaminen päivitetyllä Expo Golla ei enää onnistu. Silloin projekti päivitetään uuteen SDK-versioon Expon [päivitysohjeen](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/ "https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/") mukaisesti.

## 2 Uuden Expo-sovelluksen luominen

Seuraavaksi luodaan uusi Expo-projekti ja käynnistetään se puhelimessa. Ohjeet perustuvat Expon dokumentaation [create-expo-app](https://docs.expo.dev/more/create-expo/ "https://docs.expo.dev/more/create-expo/")- ja [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/ "https://docs.expo.dev/get-started/set-up-your-environment/") -sivuihin.

### 2.1 Projektin luominen TypeScript-mallipohjalla

Avaa VS Code kansioon, johon haluat luoda projektin. Suorita VS Coden Terminalissa komento

```bash
npx create-expo-app@latest --template blank-typescript
```

Komento purettuna:

- `npx create-expo-app@latest`: suoritetaan Expon projektinluontityökalun uusin versio. `npx` lataa ja suorittaa paketin ilman, että sitä asennetaan koneelle pysyvästi.
- `--template blank-typescript`: projektin pohjaksi valitaan tyhjä mallipohja, jossa TypeScript on valmiiksi käytössä.

Komento kysyy ensin sovelluksen nimen. Nimestä tulee projektikansion nimi, ja sama nimi asetetaan sovelluksen nimeksi `app.json`-tiedostoon. Tässä demossa nimeksi on annettu `demo-04`. Nimen jälkeen komento lataa mallipohjan ja asentaa riippuvuudet. Siirry lopuksi Terminalissa projektikansioon komennolla `cd demo-04`.

> [!NOTE]
>
> Expon omissa aloitusohjeissa komento suoritetaan usein ilman `--template`-valitsinta. Silloin pohjaksi tulee `default`-mallipohja, jossa on valmiina Expo Router -navigointi ja useita esimerkkinäkymiä. Tässä demossa käytetään tyhjää pohjaa, jotta sovelluksen rakenne pysyy mahdollisimman yksinkertaisena.

Mallipohjan lisäksi demoon on asennettu `react-native-safe-area-context`-kirjasto. Asentaminen käydään läpi luvussa [3.1](#31-packagejson-ja-riippuvuudet) ja käyttö luvussa [4.2](#42-safeareaview-ja-otsikot).

### 2.2 Sovelluksen käynnistäminen Expo Gossa

Expo-sovellusta testataan kehityksen aikana puhelimeen asennetulla Expo Go -sovelluksella. Valmistele puhelin näin:

1. Asenna Expo Go Android-puhelimeen Google Play -kaupasta.
2. Yhdistä puhelin samaan verkkoon tietokoneen kanssa, esimerkiksi samaan WLAN-verkkoon.

Käynnistä kehityspalvelin projektikansiossa samalla `npx expo start` -komennolla, joka annettiin tämän dokumentin alussa. Terminaaliin tulostuu QR-koodi ja luettelo pikanäppäimistä. Avaa Expo Go ja skannaa QR-koodi sen kautta, jolloin sovellus latautuu puhelimeen. Juuri luodussa projektissa näkyy mallipohjan teksti "Open up App.tsx to start working on your app!". Demon kansiossa käynnistettynä näkyy valmis Hello World -sovellus.

Kehityspalvelimen terminaalissa toimivat muun muassa nämä pikanäppäimet:

- `r`: sovelluksen lataaminen uudelleen puhelimessa
- `a`: sovelluksen avaaminen Android-emulaattorissa
- `Ctrl+C`: kehityspalvelimen pysäyttäminen

Pysäytetyn kehityspalvelimen voi käynnistää uudelleen samalla komennolla.

> [!WARNING]
>
> Expon dokumentaation mukaan Expo Gon asentaminen iPhoneen vaatii maksullisen Apple Developer Program -jäsenyyden ja TestFlight-sovelluksen. Ilman Android-puhelinta sovellusta voi testata näillä tavoilla:
>
> - Android-emulaattorilla, joka asennetaan Android Studion kautta. Ohjeet löytyvät Expon [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/ "https://docs.expo.dev/get-started/set-up-your-environment/") -sivulta, kun laitteeksi valitaan Android-emulaattori ja tavaksi Expo Go. Emulaattorissa sovellus avataan pikanäppäimellä `a`.
> - Selaimessa, kun projektiin asennetaan ensin web-tuen paketit komennolla `npx expo install react-dom react-native-web @expo/metro-runtime`. Web-versio avataan kehityspalvelimen terminaalissa pikanäppäimellä `w`. Selainversion ulkoasu voi poiketa puhelimessa näkyvästä.

## 3 Projektin tiedostot

Projekti on nyt luotu ja käynnistyy puhelimessa. Ennen sovelluksen rakentamista käydään läpi projektin tärkeimmät tiedostot. Demoissa muokataan käytännössä vain `App.tsx`-tiedostoa ja asennetaan tarvittavia kirjastoja.

### 3.1 package.json ja riippuvuudet

```json
{
  "name": "demo-04",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": {
    "expo": "~57.0.24",
    "expo-status-bar": "~57.0.1",
    "react": "19.2.3",
    "react-native": "0.86.3",
    "react-native-safe-area-context": "~5.7.0"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "private": true
}
```

`"main"`-kenttä määrittää sovelluksen käynnistyspisteen tiedostoksi `index.ts`. `scripts`-kentän komennot käynnistävät kaikki kehityspalvelimen `expo start` -komennolla, joten `npm start` tekee saman kuin `npx expo start`. Muissa komennoissa sovellus avataan lisäksi suoraan Android- tai iOS-laitteessa tai selaimessa.

Riippuvuuksien käyttötarkoitukset:

- `expo`: Expo SDK:n ydinpaketti, johon sisältyy myös Expo CLI -komentorivityökalu.
- `expo-status-bar`: `StatusBar`-komponentti, jolla määritetään puhelimen tilapalkin ulkoasu.
- `react`: React-kirjasto komponenttien ja hookien kirjoittamiseen.
- `react-native`: React Nativen peruskomponentit ja niiden natiivitoteutukset.
- `react-native-safe-area-context`: `SafeAreaView`-komponentti, jolla sisältö siirretään pois tilapalkin ja näytön lovien alta.
- `typescript` ja `@types/react`: TypeScript-kääntäjä ja Reactin tyyppimäärittelyt. Ne tarvitaan vain kehityksen aikana, joten ne ovat `devDependencies`-kentässä.

Mallipohjassa ei ole `react-native-safe-area-context`-kirjastoa, joten se on asennettu demoon komennolla

```bash
npx expo install react-native-safe-area-context
```

Node-projekteihin paketit asennetaan yleensä komennolla `npm install <paketti>`. Expo-projekteissa käytetään sen sijaan komentoa `npx expo install <paketti>`. Se valitsee paketista projektin Expo SDK -version kanssa yhteensopivan version ja asentaa sen npm:llä. Tavallinen `npm install` asentaa paketin uusimman version, joka ei välttämättä toimi SDK 57:n ja Expo Gon kanssa.

Sopivia kirjastoja etsitään yleensä näistä lähteistä:

- [Expon SDK 57 -dokumentaatio](https://docs.expo.dev/versions/v57.0.0/ "https://docs.expo.dev/versions/v57.0.0/"), jossa ovat Expon omat kirjastot asennusohjeineen.
- [React Native Directory](https://reactnative.directory/ "https://reactnative.directory/"), josta voi hakea myös muiden tekijöiden kirjastoja. Kirjastojen tiedoissa näkyy, toimivatko ne Expo Gossa.
- Tutoriaalit ja tekoäly. Niistä saadut ohjeet tarkistetaan SDK 57:n dokumentaatiosta, koska Expon rajapinnat muuttuvat usein SDK-versioiden välillä.

### 3.2 index.ts

```ts
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
```

`registerRootComponent`-funktio rekisteröi `App`-komponentin sovelluksen juurikomponentiksi. Tiedosto vastaa Vitellä luodun React-projektin `main.tsx`-tiedostoa, jossa `createRoot()` liitti sovelluksen HTML-sivun `root`-elementtiin. React Native -sovelluksessa ei ole HTML-sivua, joten juurikomponentti rekisteröidään suoraan React Nativelle. Tiedoston kommentin mukaan funktio valmistelee lisäksi ajoympäristön samalla tavalla Expo Gossa ja natiivisovellukseksi käännetyssä versiossa.

`index.ts`-tiedostoon ei tarvitse tehdä muutoksia. Sovelluksen koodi kirjoitetaan `App.tsx`-tiedostoon, joka tuodaan `index.ts`-tiedostoon rivillä `import App from './App';`.

### 3.3 app.json ja muut tiedostot

`app.json`-tiedostossa määritetään asetukset, joita Expo käyttää sovelluksen käynnistyksessä ja käännöksessä. Tiedoston alku näyttää tältä:

```json
{
  "expo": {
    "name": "demo-04",
    "slug": "demo-04",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    ...
  }
}
```

Demon kannalta oleelliset asetukset ovat nämä:

- `name`: sovelluksen nimi, joka näkyy Expo Gossa ja valmiin sovelluksen kuvakkeen alla.
- `orientation`: arvo `"portrait"` lukitsee sovelluksen pystysuuntaan.
- `userInterfaceStyle`: sovelluksen vaalea tai tumma ulkoasu. Demossa arvo on `"light"` eli vaalea ulkoasu.

Muilla asetuksilla määritetään sovelluksen kuvakkeet `assets`-kansiosta ja alustakohtaisia asetuksia. Kaikki asetukset on kuvattu Expon [app.json-dokumentaatiossa](https://docs.expo.dev/versions/v57.0.0/config/app/ "https://docs.expo.dev/versions/v57.0.0/config/app/").

`tsconfig.json`-tiedostossa Expon valmiit TypeScript-asetukset otetaan pohjaksi `extends`-kentällä, ja tiukat tyyppitarkistukset otetaan käyttöön asetuksella `"strict": true`.

`create-expo-app` luo projektiin myös tekoälypohjaisille koodausavustajille tarkoitetut tiedostot:

- `AGENTS.md`: ohje, jossa avustajaa ohjeistetaan lukemaan Expon SDK 57 -dokumentaatio ennen koodin kirjoittamista
- `CLAUDE.md`: viittaus `AGENTS.md`-tiedostoon Claude Code -avustajaa varten
- `.claude/settings.json`: Claude Coden asetukset, joissa Expon lisäosa on otettu käyttöön

Tiedostot eivät vaikuta sovelluksen toimintaan. Niiden luomisen voi ohittaa lisäämällä luontikomentoon valitsimen `--no-agents-md`.

## 4 Hello World -sovelluksen rakentaminen

Nyt projektin rakenne on tuttu. Seuraavaksi mallipohjan `App.tsx`-tiedostoa muokataan vaihe vaiheelta demon valmiiksi sovellukseksi, ja samalla esitellään React Nativen peruskomponentit.

### 4.1 Mallipohjan App-komponentti

Mallipohjasta luotu `App.tsx` näyttää tältä:

```tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

Komponentin rakenne on tuttu web-Reactista. Funktio palauttaa JSX:ää, ja komponentti viedään `export default` -määrityksellä. Uutta ovat palautetut komponentit ja tyylien kirjoitustapa:

- `View` on säiliökomponentti, joka vastaa webin `<div>`-elementtiä.
- `Text` tulostaa tekstin. React Nativessa tekstiä ei voi kirjoittaa suoraan `View`-komponentin sisään.
- `StatusBar` tuodaan `expo-status-bar`-kirjastosta. Arvolla `style="auto"` tilapalkin kuvakkeiden väri valitaan sovelluksen vaalean tai tumman ulkoasun mukaan.
- `StyleSheet.create()` kokoaa komponentin tyylit yhteen olioon. Olion tyyleihin viitataan `style`-propsilla, esimerkiksi `style={styles.container}`.

Tyylit kirjoitetaan CSS:n ominaisuuksilla, mutta kirjoitustapa poikkeaa CSS:stä kolmella tavalla:

- Ominaisuuksien nimet kirjoitetaan camelCase-muodossa, esimerkiksi `backgroundColor`.
- Lukuarvot annetaan ilman yksikköä. Ne ovat näytön tarkkuudesta riippumattomia yksiköitä, joten sama arvo näyttää suunnilleen samankokoiselta eri puhelimissa.
- Asettelu tehdään Flexboxilla, ja elementit asettuvat oletuksena allekkain. `flex: 1` venyttää säiliön koko näytön kokoiseksi, ja `alignItems`- ja `justifyContent`-asetuksilla sisältö keskitetään.

> [!TIP]
>
> **Harjoitus.** Kirjoita tekstiä suoraan `View`-komponentin sisään ilman `Text`-komponenttia ja tallenna tiedosto. Puhelimeen tulee virheilmoitus `Text strings must be rendered within a <Text> component`. Poista kokeilu, kun olet nähnyt virheen.

### 4.2 SafeAreaView ja otsikot

Mallipohjassa sisältö on keskitetty näytön keskelle, mutta demossa sisällön halutaan alkavan näytön yläreunasta. Nykyisissä Android- ja iOS-laitteissa sovellus piirretään koko näytön alueelle, myös tilapalkin ja kameran loven alle. Jos keskitys vain poistetaan, otsikko jää tilapalkin alle piiloon. Siksi `View`-komponentti korvataan `SafeAreaView`-komponentilla, joka lisää sisällön ympärille tilapalkin ja näytön reunojen vaatiman tyhjän tilan.

`View`-komponenttia ei enää tarvita. Valmiin komponentin tuonnit ovat tällaiset:

```tsx
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

Muut uudet tuonnit otetaan käyttöön luvuissa 4.3 ja 4.4. `SafeAreaView` korvaa uloimman `View`-komponentin, ja sen sisälle kirjoitetaan kaksi otsikkoa:

```tsx
<SafeAreaView style={styles.container}>

    <Text style={{ fontSize: 20 }}>Demo 4: React Native -perusteita</Text>

    <Text style={styles.alaotsikko}>Hello world</Text>

    ...

    <StatusBar style="auto" />

</SafeAreaView>
```

```tsx
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 0,
        padding: 10,
    },
    alaotsikko: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    ...
});
```

`container`-tyylistä on poistettu keskittävät `alignItems`- ja `justifyContent`-asetukset, ja tilalle on lisätty sisennys `padding: 10`.

> [!WARNING]
>
> `SafeAreaView`-komponentti löytyy myös `react-native`-paketista, ja monissa netin ohjeissa se tuodaan sieltä. React Nativen oma `SafeAreaView` on merkitty vanhentuneeksi, ja se poistetaan tulevassa versiossa. Siksi komponentti tuodaan `react-native-safe-area-context`-kirjastosta, joka asennettiin luvussa [3.1](#31-packagejson-ja-riippuvuudet).

React Nativessa ei ole `<h1>`- tai `<h2>`-elementtejä, joten otsikot tehdään `Text`-komponentteina, joiden fonttikokoa kasvatetaan. Pääotsikon tyyli on kirjoitettu suoraan `style`-propsiin, ja alaotsikon tyyli haetaan `styles`-oliosta. Molemmat tavat toimivat. `styles`-olion avulla JSX pysyy lyhyempänä ja tyylit ovat yhdessä paikassa, joten sitä käytetään useimmiten. Kaksinkertaiset aaltosulkeet `{{ fontSize: 20 }}` toimivat samoin kuin web-Reactin `style`-attribuutissa.

### 4.3 Tekstikenttä ja tilamuuttuja

Otsikoiden alle lisätään seuraavaksi tekstikenttä, johon käyttäjä kirjoittaa nimensä. React Nativessa tekstikenttä on `TextInput`-komponentti. Kenttään kirjoitettu nimi tallennetaan `nimi`-tilamuuttujaan.

```tsx
const [nimi, setNimi] = useState<string>('');
```

```tsx
<TextInput
    style={styles.tekstikentta}
    placeholder="Anna nimesi..."
    value={nimi}
    onChangeText={(teksti) => setNimi(teksti)}
/>
```

`placeholder` toimii kuten webin `<input>`-elementissä. `onChangeText`-käsittelijä suoritetaan aina, kun kentän teksti muuttuu, ja se saa parametrina kentän uuden tekstin merkkijonona. Web-Reactissa sama tieto luettiin `onChange`-tapahtumasta muodossa `e.target.value`. Käsittelijässä uusi teksti tallennetaan `nimi`-tilamuuttujaan.

`value`-propsilla tekstikentän sisällöksi asetetaan `nimi`-tilamuuttujan arvo. Tekstikentän sisältö ja tilamuuttuja pysyvät siis aina samoina. Kun tilamuuttujan arvoa muutetaan koodissa, myös tekstikentän sisältö muuttuu. Tätä käytetään luvussa 4.4, jossa tekstikenttä tyhjennetään asettamalla tilamuuttujan arvoksi tyhjä merkkijono.

### 4.4 Painike ja tervehdyksen näyttäminen

Lopuksi lisätään tervehdyksen muodostava painike ja tervehdyksen tulostus. Tervehdys tallennetaan tilamuuttujaan, koska näkymän on päivityttävä aina, kun tervehdys muuttuu.

```tsx
const [tervehdys, setTervehdys] = useState<string>('');

const sanoHeippa = () => {
    setTervehdys(`Heippa ${nimi}!`);
    setNimi('');
};
```

`sanoHeippa`-funktiossa on kaksi vaihetta:

1. Tervehdys muodostetaan `nimi`-tilamuuttujasta template string -muotoilulla ja tallennetaan `tervehdys`-tilamuuttujaan.
2. `nimi`-tilamuuttujan arvoksi asetetaan tyhjä merkkijono. Tekstikentän `value` on sidottu tilamuuttujaan, joten tekstikenttä tyhjenee.

Funktio liitetään painikkeeseen:

```tsx
<Button
    title="Sano heippa"
    onPress={sanoHeippa}
/>
```

`Button`-komponentin teksti annetaan `title`-propsina, ja painalluksen käsittelijä annetaan `onPress`-propsina. Webin `<button>`-elementissä teksti kirjoitetaan elementin sisään ja käsittelijä `onClick`-attribuuttiin. `Button` piirretään käyttöjärjestelmän omana painikkeena, joten se näyttää erilaiselta Androidissa ja iOS:ssä. Komponentilla ei ole `style`-propsia, ja sen ulkoasua voi muuttaa vain `color`-propsilla. Demossa 5 käyttöliittymä rakennetaan React Native Paper -kirjaston komponenteilla, joilla sovellukselle saadaan yhtenäinen Material Design -ulkoasu.

Tervehdys tulostetaan painikkeen alle ehdollisesti:

```tsx
{Boolean(tervehdys) && <Text style={styles.tervehdys}>{tervehdys}</Text>}
```

Ehdollinen tulostus toimii samalla `&&`-rakenteella kuin web-Reactissa. `Boolean()`-muunnoksen ansiosta lausekkeen tulos on aina joko `false` tai `Text`-elementti. React Nativessa muunnos on erityisen tärkeä, koska esimerkiksi luku `0` tulostuisi `&&`-lausekkeesta sellaisenaan ilman `Text`-komponenttia ja aiheuttaisi luvussa 4.1 esitellyn virheen.

> [!TIP]
>
> **Harjoitus.** Jos painiketta painetaan ennen nimen kirjoittamista, näytölle tulee teksti "Heippa !". Lisää `sanoHeippa`-funktion alkuun tarkistus, joka keskeyttää funktion tyhjällä nimellä. Tarkistus kirjoitetaan samalla tavalla kuin web-Reactissa, esimerkiksi `if (!nimi.trim()) return;`.

Valmis komponentti on kokonaisuudessaan tiedostossa [App.tsx](./App.tsx).

## 5 Sovelluksen testaaminen

Sovellus on nyt valmis. Sitä testataan puhelimessa näin:

1. Käynnistä kehityspalvelin ja avaa sovellus Expo Gossa luvun [2.2](#22-sovelluksen-käynnistäminen-expo-gossa) ohjeiden mukaisesti.
2. Kirjoita nimesi tekstikenttään.
3. Paina "Sano heippa" -painiketta. Painikkeen alle tulee tervehdys, esimerkiksi "Heippa Matti!", ja tekstikenttä tyhjenee.
4. Muuta `App.tsx`-tiedostossa esimerkiksi alaotsikon tekstiä ja tallenna tiedosto. Muutos päivittyy puhelimeen Fast Refreshin avulla.

Jos muutos ei näy puhelimessa, lataa sovellus uudelleen luvussa 2.2 esitellyllä pikanäppäimellä `r`.

Seuraavassa demossa otetaan käyttöön React Native Paper -komponenttikirjasto ja Expo SDK:n kirjastot, joilla luetaan puhelimen laite- ja akkutietoja.
