# Demo 9: referenssi

## 1. Reitit

Valmiin palvelimen reitit ovat tiedostossa `server/routes/tehtavat.ts`. Reititin liitetään polkuun `/api/tehtavat` tiedostossa `server/index.ts`, ja asiakasohjelma kutsuu reittejä Viten välityspalvelimen kautta.

> ⚠️ **FACT-CHECK:** `server/index.ts` liittää reitittimen rivillä 8 polkuun `'api/tehtavat'` ilman alkukauttaviivaa, ja testiajossa `GET /api/tehtavat` palautti 404. Taulukko kuvaa reitit polulla `'/api/tehtavat'`, jolla ne toimivat testissä.

| Metodi | Polku | Pyynnön runko | Vastaus | Huomiot |
|---|---|---|---|---|
| GET | `/api/tehtavat` | — | `Tehtava[]` | Kaikki tehtävät (`findMany`). Tarjoajan efekti hakee listan tällä reitillä. |
| POST | `/api/tehtavat` | `{ nimi: string }` | luotu `Tehtava` | `suoritettu` saa oletusarvon `false`. Kutsutaan funktiossa `lisaaTehtava`. |
| PUT | `/api/tehtavat/:id` | `{ nimi: string, suoritettu: boolean }` | päivitetty `Tehtava` | Päivittää molemmat kentät rungon arvoilla. Rungon muut kentät, kuten `id`, jätetään huomiotta. `vaihdaSuoritus` lähettää koko tehtävän käänteisellä `suoritettu`-arvolla. |
| DELETE | `/api/tehtavat/:id` | — | poistettu `Tehtava` | `poistaTehtava` ei käytä vastausta. |

Reiteillä ei ole omaa virheenkäsittelyä. Jos annetulla `id`:llä ei ole tehtävää, Prisman virhe päätyy Expressin oletusvirheenkäsittelijälle, joka vastaa tilakoodilla 500.

## 2. Mallit

| Malli | Kentät | Relaatiot |
|---|---|---|
| `Tehtava` | `id: Int` (`@id`, `@default(autoincrement())`)<br>`nimi: String`<br>`suoritettu: Boolean` (`@default(false)`) | — |

Malli on tiedostossa `server/prisma/schema.prisma`, ja tietokanta on SQLite-tiedosto `server/dev.db`.

## 3. Konteksti

| Konteksti | Tarjoaja | Arvon kentät (nimi: tyyppi) | Käyttäjät |
|---|---|---|---|
| `TehtavaContext`, tyyppi `TehtavaKonteksti \| null`, oletusarvo `null`. Luetaan hookilla `useTehtavat`. | `TehtavaProvider`, joka käärii `App`-komponentin tiedostossa `client/src/main.tsx` | `tehtavat: Tehtava[]`<br>`lisaysDialogi: boolean`<br>`setLisaysDialogi: (auki: boolean) => void`<br>`poistoDialogi: PoistoDialogi`<br>`setPoistoDialogi: (poistoDialogi: PoistoDialogi) => void`<br>`lisaaTehtava: (nimi: string) => void`<br>`vaihdaSuoritus: (tehtava: Tehtava) => void`<br>`poistaTehtava: (id: number) => void` | `App` (`setLisaysDialogi`)<br>`Tehtavalista` (`tehtavat`, `setPoistoDialogi`, `vaihdaSuoritus`)<br>`PoistaTehtava` (`poistoDialogi`, `setPoistoDialogi`, `poistaTehtava`)<br>`LisaaTehtava` (`lisaysDialogi`, `setLisaysDialogi`, `lisaaTehtava`) |

Konteksti, tarjoaja ja hook ovat tiedostossa `client/src/context/TehtavaContext.tsx`. `useTehtavat` heittää virheen, jos sitä kutsutaan tarjoajan ulkopuolella.

## 4. Komponentit

| Komponentti | Tiedosto | Propsit (nimi: tyyppi) | Kuvaus |
|---|---|---|---|
| `App` | `client/src/App.tsx` | — | Sivun asettelu, otsikot ja painike, joka avaa lisäysdialogin. Renderöi komponentit `Tehtavalista` ja `LisaaTehtava`. |
| `Otsikko` | `client/src/components/Otsikko.tsx` | `children: string`<br>`taso: "pieni" \| "iso"` | Näyttää tekstin `Typography`-komponentilla. Taso `pieni` käyttää muunnelmaa `h6` ja taso `iso` muunnelmaa `h5`. |
| `Tehtavalista` | `client/src/components/Tehtavalista.tsx` | — | Tehtävät MUI:n `List`-komponenttina. Valintaruutupainike vaihtaa suoritustilan, ja roskakoripainike avaa poistodialogin. Renderöi komponentin `PoistaTehtava`. |
| `PoistaTehtava` | `client/src/components/PoistaTehtava.tsx` | — | Poiston vahvistusdialogi, joka näyttää poistettavan tehtävän nimen. |
| `LisaaTehtava` | `client/src/components/LisaaTehtava.tsx` | — | Lisäysdialogi. Tekstikentän arvo luetaan `useRef`-viittauksella, ja tyhjällä kentällä nimeksi tulee `(nimetön tehtävä)`. |
| `TehtavaProvider` | `client/src/context/TehtavaContext.tsx` | `children: React.ReactNode` | Kontekstin tarjoaja, jossa ovat jaettu tila, palvelinkutsut ja tehtävien haku (ks. luku 3). |

## 5. Tekniikat

### 5.1 Ydinmalli: konteksti, tarjoaja ja hook

Yleistetty esimerkki samasta rakenteesta, jota `TehtavaContext.tsx` käyttää. Konteksti, tarjoaja ja hook ovat samassa tiedostossa:

```tsx
import { createContext, useContext, useState } from 'react';

interface LaskuriKonteksti {
  maara: number;
  kasvata: () => void;
}

const LaskuriContext = createContext<LaskuriKonteksti | null>(null);

interface Props {
  children: React.ReactNode;
}

export const LaskuriProvider = ({ children }: Props) => {

  const [maara, setMaara] = useState<number>(0);

  const kasvata = (): void => {
    setMaara((edellinen: number) => edellinen + 1);
  };

  return (
    <LaskuriContext value={{ maara, kasvata }}>
      {children}
    </LaskuriContext>
  );
};

export const useLaskuri = (): LaskuriKonteksti => {

  const konteksti = useContext(LaskuriContext);

  if (!konteksti) {
    throw new Error("useLaskuri-hookia pitää käyttää LaskuriProviderin sisällä");
  }

  return konteksti;
};
```

Tarjoaja kääritään sovelluksen ympärille tiedostossa `main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LaskuriProvider } from './LaskuriContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LaskuriProvider>
      <App />
    </LaskuriProvider>
  </StrictMode>,
)
```

Mikä tahansa tarjoajan sisällä oleva komponentti lukee arvon hookilla:

```tsx
import { useLaskuri } from './LaskuriContext';

const Laskuri = () => {

  const { maara, kasvata } = useLaskuri();

  return (
    <button onClick={kasvata}>Painettu {maara} kertaa</button>
  );
};

export default Laskuri;
```

### 5.2 Palvelinkutsu ja tilan päivitys tarjoajassa

Funktio lähettää muutoksen palvelimelle ja korvaa tilasta saman `id`:n tehtävän palvelimen palauttamalla versiolla (`TehtavaProvider`-komponentin sisällä):

```tsx
const vaihdaSuoritus = async (tehtava: Tehtava): Promise<void> => {
  const vastaus = await fetch(`/api/tehtavat/${tehtava.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...tehtava, suoritettu: !tehtava.suoritettu }),
  });
  const paivitetty: Tehtava = await vastaus.json();

  setTehtavat((edelliset: Tehtava[]) =>
    edelliset.map((tehtava: Tehtava) =>
      tehtava.id === paivitetty.id ? paivitetty : tehtava
    )
  );
};
```

### 5.3 Datan haku efektissä

Efekti hakee tehtävät kerran tarjoajan ensimmäisen renderöinnin jälkeen. Siivousfunktion asettama `ignore` estää vanhentuneen vastauksen tallentamisen tilaan (`TehtavaProvider`-komponentin sisällä):

```tsx
useEffect(() => {

  let ignore = false;

  const haeTehtavat = async (): Promise<void> => {
    const vastaus = await fetch("/api/tehtavat");
    const data: Tehtava[] = await vastaus.json();

    if (!ignore) {
      setTehtavat(data);
    }
  };

  haeTehtavat();

  return () => {
    ignore = true;
  };

}, []);
```

### 5.4 Dialogin tila kontekstissa

Yleistetty esimerkki demon poistodialogin rakenteesta. Avaava painike ja dialogi ovat eri komponenteissa, ja ne käyttävät samaa kontekstin tilaa:

```tsx
import { Dialog, DialogTitle, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { useTehtavat, type Tehtava } from '../context/TehtavaContext';

interface Props {
  tehtava: Tehtava;
}

export const PoistoPainike = ({ tehtava }: Props) => {

  const { setPoistoDialogi } = useTehtavat();

  return (
    <IconButton onClick={() => setPoistoDialogi({ tehtava, auki: true })}>
      <DeleteIcon />
    </IconButton>
  );
};

export const PoistoVahvistus = () => {

  const { poistoDialogi, setPoistoDialogi } = useTehtavat();

  return (
    <Dialog
      open={poistoDialogi.auki}
      onClose={() => setPoistoDialogi({ ...poistoDialogi, auki: false })}
    >
      <DialogTitle>Poistetaanko {poistoDialogi.tehtava?.nimi}?</DialogTitle>
    </Dialog>
  );
};
```

### 5.5 Viten välityspalvelin

Kehityspalvelin toimii portissa 3000 ja ohjaa `/api`-alkuiset pyynnöt palvelimelle porttiin 3009 (`client/vite.config.ts`):

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3009'
    }
  }
})
```

## 6. Tyypit ja rajapinnat

Tyypit on määritelty tiedostossa `client/src/context/TehtavaContext.tsx`.

| Nimi | Kentät | Käyttäjät |
|---|---|---|
| `Tehtava` | `id: number`<br>`nimi: string`<br>`suoritettu: boolean` | `TehtavaKonteksti`, `PoistoDialogi`, `TehtavaProvider`, `Tehtavalista` |
| `PoistoDialogi` | `tehtava: Tehtava \| null`<br>`auki: boolean` | `TehtavaKonteksti`, `TehtavaProvider` (tila `poistoDialogi`) |
