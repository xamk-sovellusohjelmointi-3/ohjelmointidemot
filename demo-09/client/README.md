# Demo 9: asiakasohjelma

Tämä ohje luo demon 9 asiakasohjelman alusta alkaen. Ohje on osa pääohjeen [lukua 4.2](../README.md#42-asiakasohjelman-luominen), ja viimeisen vaiheen jälkeen palataan pääohjeen [lukuun 4.3](../README.md#43-otsikko-komponentti). Valmiin demon asiakasohjelma käynnistetään pääohjeen luvun [Kloonaus ja käynnistys](../README.md#2-kloonaus-ja-käynnistys) mukaisesti.

Palvelin on käynnissä omassa terminaalissaan [server/README.md](../server/README.md)-tiedoston ohjeiden mukaisesti, koska viimeisessä vaiheessa tarkistetaan yhteys palvelimelle.

## 1. Projektin luominen

Asiakasohjelmaa varten avataan uusi terminaali projektikansioon, jossa `server`-kansio on. Projekti luodaan Viten React + TypeScript -pohjasta. Ohje on kirjoitettu Viten versiolle 8.

```bash
npm create vite@latest client -- --template react-ts
```

Jos npm kysyy lupaa `create-vite`-paketin asentamiseen, vastataan `y`. Kysymykseen "Which linter to use?" vastataan painamalla Enter, jolloin valitaan oletusvaihtoehto. Kysymykseen "Install with npm and start now?" vastataan valitsemalla No, koska ennen käynnistystä asennetaan vielä MUI ja muutetaan pohjan asetuksia.

Pohjan paketit asennetaan `client`-kansiossa:

```bash
cd client
npm install
```

## 2. MUI:n asentaminen

Käyttöliittymän komponentit tulevat MUI-kirjastosta kuten Sovellusohjelmointi 1 -kurssilla.

```bash
npm install @mui/material @emotion/react @emotion/styled @fontsource/roboto @mui/icons-material
```

`@mui/material` sisältää komponentit, ja `@emotion/react` ja `@emotion/styled` ovat MUI:n käyttämä tyylikirjasto. `@fontsource/roboto` asentaa MUI:n oletusfontin Roboto, ja `@mui/icons-material` sisältää kuvakkeet.

## 3. Ylimääräisten tiedostojen poistaminen

Pohjan esimerkkisovelluksen kuvia ja tyylejä ei tarvita, koska sovelluksen ulkoasu tehdään MUI:lla. Kansiot `public` ja `src/assets` poistetaan kokonaan, samoin tiedostot `src/App.css` ja `src/index.css`.

Tiedostosta `index.html` poistetaan rivi `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`, koska se viittaa poistetun `public`-kansion kuvakkeeseen. Muutoksen jälkeen tiedosto näyttää tältä:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>client</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Poistojen jälkeen `client`-kansion rakenne on seuraava (`node_modules` ei näy puussa):

```text
client/
├── src/
│   ├── App.tsx
│   └── main.tsx
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 4. Fontin tuominen

Tiedostosta `src/main.tsx` poistetaan rivi `import './index.css'`, koska tiedosto poistettiin. Sen tilalle tuodaan Roboto-fontin painot, joita MUI:n oletusteema käyttää:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/300.css' // uusi
import '@fontsource/roboto/400.css' // uusi
import '@fontsource/roboto/500.css' // uusi
import '@fontsource/roboto/700.css' // uusi
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## 5. Sivupohja

Tiedoston `src/App.tsx` sisältö korvataan kokonaan sivupohjalla, johon pääohjeessa lisätään sovelluksen komponentit:

```tsx
import { Container, CssBaseline, Stack } from '@mui/material';

const App = () => {

  return (
    <>
      <CssBaseline />
      <Container sx={{ m: 3}}>
        <Stack spacing={2}>
        </Stack>
      </Container>
    </>
  );
};

export default App;
```

`CssBaseline` lisää MUI:n perustyylit, jotka yhtenäistävät selainten oletustyylit. `Container` rajaa sisällön leveyden, ja `Stack` asettaa sen sisälle tulevat komponentit allekkain tasaisin välein.

## 6. Portti ja välityspalvelin

Asiakasohjelma kutsuu palvelinta suhteellisilla osoitteilla, kuten `/api/tehtavat`. Selain lähettää tällaisen pyynnön samaan osoitteeseen, josta sivu ladattiin, eli Viten kehityspalvelimelle. **Välityspalvelin** (proxy) on kehityspalvelimen asetus, joka ohjaa `/api`-alkuiset pyynnöt eteenpäin Express-palvelimelle osoitteeseen `http://localhost:3009`. Selain on yhteydessä vain kehityspalvelimeen, joten palvelimelle ei tarvita CORS-asetuksia.

Välityspalvelin ja kehityspalvelimen portti 3000 määritellään tiedostossa `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // uusi
    port: 3000, // uusi
    proxy: { // uusi
      '/api': 'http://localhost:3009' // uusi
    } // uusi
  } // uusi
})
```

Aiheesta lisää: [Viten server.proxy-asetus](https://vite.dev/config/server-options#server-proxy).

## 7. Käynnistys ja tarkistus

Kehityspalvelin käynnistetään `client`-kansiossa:

```bash
npm run dev
```

Selaimessa avataan osoite <http://localhost:3000>. Sivu on tyhjä, ja välilehden otsikkona on `client`. Välityspalvelimen toiminta tarkistetaan avaamalla osoite <http://localhost:3000/api/tehtavat>, jolloin selaimessa näkyy palvelimen palauttama tehtävälista JSON-muodossa.

Kehityspalvelin jätetään käyntiin, ja ohjetta jatketaan pääohjeen [luvusta 4.3](../README.md#43-otsikko-komponentti).
