# Ohjeistus Expon käyttöönottoon

Tässä ohjeessa otetaan Expo käyttöön omalla koneella ja sovellusta testataan Android- ja iOS-laitteilla.

Tiedot on tarkistettu 21.9.2026 Expon dokumentaatiosta ja muutoslokista sekä Applen ja Googlen sovelluskaupoista. Expon tilanne muuttuu nopeasti, erityisesti iOS:n osalta. Jos jokin ei toimi ohjeen mukaan, tarkista ensin [Expon muutosloki](https://expo.dev/changelog). Jos ongelma ei ratkea, ota yhteyttä opettajaan.

Etene näin:

1. Valitse luvun 1 taulukosta itsellesi sopiva kehitysympäristö.
2. Asenna yhteiset työkalut luvun 2 ohjeilla.
3. Ota valitsemasi laite käyttöön luvussa 3 (Android) tai luvussa 4 (iOS).

## 1 Expon tilanne syyskuussa 2026

Kirjoitushetkellä Expon uusin vakaa SDK -versio on 57, ja tätä tuetaan oletuksena kunnes SDK 58 -versio julkaistaan täysin. Kun SDK 58 -versio on uusin saatavilla oleva vakaa versio, demoissa olevat koodit voivat rikkoutua ja muutokset pitää tarkastaa uuden version mukaan. Hyvässä tapauksessa vanhat SDK 57 -koodit toimivat päivityksen jälkeen edelleen, mutta mikäli ongelmia tulee, on oltava yhteydessä opettajaan.

| Expo -versio | Tilanne |
|---|---|
| Vakaa Expo SDK | **57** (React Native 0.86, React 19.2) |
| SDK 57:n vähimmäisvaatimukset | Node.js 22.13, Android 7, iOS 16.4 |
| Seuraava versio | SDK 58:n beta julkaistiin 15.9.2026. Vakaa versio julkaistaan pian React Native 0.88:n jälkeen. |
| Expo Go, Google Play | 57.0.9 (päivitetty 17.8.2026), tukee SDK 57:ää |
| Expo Go, App Store | 57.0.9 (päivitetty 2.9.2026), tukee SDK 57:ää, ilmainen |

Expo-sovelluksia testataan mobiililaitteen sovelluskaupasta ladattavalla Expo Go -sovelluksella. Kehittämisen kannalta tärkeimmät asiat:

1. **Expo Go -sovellus tukee vain yhtä SDK-versiota kerrallaan.** Projektin SDK-version (`package.json`-tiedoston `expo`-riippuvuus) ja Expo Gon SDK-version on oltava samat. Muuten Expo Go näyttää virheen *"Project is incompatible with this version of Expo Go"*. Kun SDK 58 julkaistaan, Google Playn ja App Storen Expo Go päivittyy SDK 58:aan ja SDK 57:n tuki loppuu. Androidille sopivan vanhemman version saa aina osoitteesta [expo.dev/go](https://expo.dev/go).
2. **iOS:n Expo Go vaatii 3.9.2026 alkaen kirjautumisen.** Sinun on kirjauduttava samalle Expo-tilille sekä terminaalissa että Expo Go -sovelluksessa. Tili on ilmainen. Expo laajentaa vaatimuksen myöhemmin myös Androidiin.
3. **Expon asennusohje on osittain vanhentunut.** Ohjeessa lukee, että iPhonen Expo Go vaatii maksullisen Apple Developer Program -jäsenyyden. Tieto koskee kevättä 2026, jolloin App Storen Expo Go ei tukenut uusimpia SDK-versioita. Nyt App Storen Expo Go tukee SDK 57:ää, eikä jäsenyyttä tarvita.
4. **Expo Go on oppimisympäristö.** Expo Gossa voi käyttää vain siihen sisällytettyjä kirjastoja. Niitä ovat Expo SDK:n kirjastot, kuten `expo-location` ja `expo-sqlite`, sekä pelkällä JavaScriptillä toteutetut kirjastot, kuten React Native Paper. Jos sovellus käyttää muuta natiivikoodia, tarvitaan oma *development build*. Development build on projektista käännetty oma sovellus, jossa on mukana Expon kehitystyökalut.

### Kehitysympäristön valinta

| Kehitysympäristö | Tarvitaan | Hinta | Huomioitavaa |
|---|---|---|---|
| Android-puhelin + Expo Go | Android 7 tai uudempi | Ilmainen | Helpoin tapa |
| Android-emulaattori | Android Studio, prosessorin virtualisointituki | Ilmainen | Windows, macOS ja Linux. Toimii kaikilla SDK-versioilla. |
| iPhone + Expo Go | iOS 16.4 tai uudempi, Expo-tili | Ilmainen | Toimii vain, kun kurssin SDK on sama kuin App Storen versiossa |
| iOS-simulaattori | Mac ja Xcode | Ilmainen | Vain macOS. Toimii kaikilla SDK-versioilla. |
| Development build iPhoneen Macilla | Mac, Xcode ja Apple ID | Ilmainen | Asennus vanhenee 7 päivässä |
| Development build iPhoneen EAS:llä tai oma Expo Go (`eas go`) | Apple Developer Program | Vuosimaksu | Opintojakso ei vaadi maksullisen kehitysympäristön käyttöä. Jos ongelmia tulee, selvitetään tilanne ja etsitään vaihtoehtoinen ratkaisu. |

**Suositus:** käytä kurssilla ensisijaisesti Android-puhelinta. Jos sinulla on iPhone, voit testata sovellusta myös sillä, kunhan App Storen Expo Go tukee kurssin SDK-versiota. Emulaattoreiden käyttö pitää selvittää itse Expon ohjeistuksista, sillä jokaisen kohdalla emulaattorin alustus tapahtuu kehityslaitteen tarpeiden mukaan.

## 2 Yhteiset esivaatimukset

1. **Node.js.** Asenna [Node.js:n LTS-versio](https://nodejs.org/en/). SDK 57 vaatii vähintään version 22.13. Tarkista versio komennolla `node -v`.
2. **Expo-tili.** Luo ilmainen tili osoitteessa [expo.dev/signup](https://expo.dev/signup) ja kirjaudu terminaalissa:

    ```bash
    npx expo login
    ```

    Kirjautuminen on pakollista iPhonella. Androidilla se on vapaaehtoista, mutta kun olet kirjautunut, Expo Go näyttää käynnissä olevat kehityspalvelimesi suoraan sovelluksessa.
3. **Projektin riippuvuudet.** Kun olet kloonannut kurssin projektin, asenna sen riippuvuudet projektikansiossa komennolla:

    ```bash
    npm ci
    ```

    Kehityspalvelin käynnistetään luvuissa 3 ja 4 laitteen ohjeen mukaan. Kun haluat pysäyttää kehityspalvelimen, paina terminaalissa `Ctrl+C`.
4. **Verkko.** Jos testaat oikealla puhelimella, puhelimen ja tietokoneen on oltava samassa verkossa. Julkiset verkot estävät usein laitteiden väliset yhteydet. Käynnistä silloin kehityspalvelin tunnelin kautta komennolla `npx expo start --tunnel`. Tunnelin kautta sovellus päivittyy hitaammin, joten käytä sitä vain tarvittaessa.

## 3 Android

### 3.1 Android-puhelin ja Expo Go

1. Asenna [Expo Go Google Playsta](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Käynnistä kehityspalvelin projektikansiossa komennolla `npx expo start`.
3. Avaa Expo Go ja skannaa QR-koodi sovelluksen *Scan QR code* -toiminnolla.

Jos projekti käyttää eri SDK-versiota kuin Google Playn Expo Go, lataa oikea versio osoitteesta [expo.dev/go](https://expo.dev/go) ja asenna se puhelimeen.

### 3.2 Android-emulaattori (Android Studio)

Lue [Expon ohjeet Android-emulaattorin käytöstä](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=expo-go). Huomioi, että emulaattorin käyttö vaatii virtualisointituen tietokoneella.

## 4 iOS

### 4.1 iPhone ja Expo Go (Windows, Linux ja macOS)

Ilman Macia sovelluksen iOS-versiota voi testata vain omalla iPhonella Expo Gossa. Tähän ei tarvita maksullista Apple Developer Program -jäsenyyttä.

1. Asenna [Expo Go App Storesta](https://apps.apple.com/app/expo-go/id982107779). Se vaatii iOS 16.4:n tai uudemman.
2. Kirjaudu Expo Gossa oikean yläkulman tilikuvakkeesta samalle tilille, jolla kirjauduit terminaalissa luvussa 2.
3. Käynnistä kehityspalvelin projektikansiossa komennolla `npx expo start` ja skannaa QR-koodi iPhonen **kamerasovelluksella**.
4. Jos näet tiliin liittyvän virheen, kirjaudu Expo Goon uudelleen ja paina **Try Again**.

**Rajoitukset:**

- App Storen Expo Go toimii vain, kun projektin SDK-versio on sama kuin Expo Gon. Applen säännöt estävät vanhemman Expo Go -version asentamisen iPhoneen. Jos kurssin projekti ei aukea iPhonessa SDK-päivityksen jälkeen, käytä Android-emulaattoria tai Android-puhelinta.

### 4.2 iOS-simulaattori (vain macOS)

1. Asenna [Xcode](https://apps.apple.com/us/app/xcode/id497799835) Mac App Storesta.
2. Avaa Xcode ja valitse *Settings → Locations → Command Line Tools* -valikosta uusin versio.
3. Asenna simulaattori valitsemalla *Settings → Components → Platform Support → iOS* ja painamalla **Get**.
4. Käynnistä kehityspalvelin projektikansiossa komennolla `npx expo start` ja paina `i`. Expo CLI asentaa simulaattoriin projektin SDK-versiota vastaavan Expo Gon automaattisesti.

Simulaattori ei vaadi Apple Developer Program -jäsenyyttä, ja se toimii kaikilla SDK-versioilla.

### 4.3 Oma development build iPhoneen

Development buildia tarvitaan vain, jos sovellus käyttää natiivikirjastoja, joita Expo Go ei sisällä.

**Macilla ilmaisella Apple ID:llä.**

1. Kirjaudu Xcodeen Apple ID:lläsi kohdassa *Settings → Accounts*. Xcode luo tilillesi ilmaisen *Personal Team* -tiimin.
2. Liitä iPhone tietokoneeseen USB-kaapelilla.
3. Ota iPhonessa käyttöön *Asetukset → Tietosuoja ja turvallisuus → Kehittäjätila*.
4. Aja projektikansiossa seuraavat komennot:

    ```bash
    npx expo install expo-dev-client
    npx expo run:ios --device
    ```

Ilmaisella Apple ID:llä on nämä rajoitukset:

- Asennus vanhenee 7 päivässä, minkä jälkeen sovellus on rakennettava ja asennettava uudelleen.
- Laitteella voi olla enintään 3 omaa sovellusta.
- Tilille voi rekisteröidä enintään 3 laitetta.

## Lähteet

- [Expo: Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/)
- [Expo: Create a project](https://docs.expo.dev/get-started/create-a-project/) ja [Start developing](https://docs.expo.dev/get-started/start-developing/)
- [Expo: Android Studio Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Expo: SDK 57 -versiotaulukot](https://docs.expo.dev/versions/v57.0.0/)
- [Expo: "Project is incompatible with this version of Expo Go"](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
- [Expo: Tools (Snack ja expo-go CLI)](https://docs.expo.dev/develop/tools/)
- [Expo-muutosloki: Login now required for running projects in Expo Go (3.9.2026)](https://expo.dev/changelog/expo-go-57-login)
- [Expo-muutosloki: SDK 58 Beta (15.9.2026)](https://expo.dev/changelog/sdk-58-beta)
- [Expo-muutosloki: Expo Go and the App Store in May 2026](https://expo.dev/changelog/expo-go-and-app-store-may-2026)
- [Android Developers: Configure hardware acceleration](https://developer.android.com/studio/run/emulator-acceleration)
- [Apple: Compare memberships](https://developer.apple.com/support/compare-memberships/) ja [Fee waivers](https://developer.apple.com/help/account/membership/fee-waivers/)
- [Genymotion: Desktop requirements](https://support.genymotion.com/hc/en-us/articles/360005432518-What-are-Genymotion-Desktop-requirements), [Is Genymotion free?](https://support.genymotion.com/hc/en-us/articles/24478777837597-Is-Genymotion-free) ja [Global Settings](https://docs.genymotion.com/desktop/02_Application/)
