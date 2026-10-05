# Demo 9: Context API

## Sisällysluettelo

- [1. Oppimistavoitteet](#1-oppimistavoitteet)
- [2. Kloonaus ja käynnistys](#2-kloonaus-ja-käynnistys)
- [3. Projektin rakenne alussa](#3-projektin-rakenne-alussa)
- [4. Tutoriaali](#4-tutoriaali)
  - [4.1 Palvelimen käynnistäminen](#41-palvelimen-käynnistäminen)
  - [4.2 Asiakasohjelman luominen](#42-asiakasohjelman-luominen)
  - [4.3 Otsikko-komponentti](#43-otsikko-komponentti)
  - [4.4 Konteksti ja tarjoaja](#44-konteksti-ja-tarjoaja)
  - [4.5 Oma hook kontekstin lukemiseen](#45-oma-hook-kontekstin-lukemiseen)
  - [4.6 Tarjoajan lisääminen sovellukseen](#46-tarjoajan-lisääminen-sovellukseen)
  - [4.7 Poistodialogi](#47-poistodialogi)
  - [4.8 Tehtävälista](#48-tehtävälista)
  - [4.9 Lisäysdialogi](#49-lisäysdialogi)
  - [4.10 Komponenttien kokoaminen App-komponenttiin](#410-komponenttien-kokoaminen-app-komponenttiin)
- [5. Sovelluksen testaaminen](#5-sovelluksen-testaaminen)
- [6. Projektin rakenne lopussa](#6-projektin-rakenne-lopussa)
- [7. Yhteenveto](#7-yhteenveto)
- [8. Jatka harjoittelua](#8-jatka-harjoittelua)

## 1. Oppimistavoitteet

Demo 9 palaa Expo-demojen jälkeen web-Reactiin, joka on tuttu Sovellusohjelmointi 1 -kurssilta, jossa rakennettiin frontend-sovelluksien käyttöliittymiä Reactilla. Demossa yhdistellään aiempien opintojaksojen aiheita ja rakennetaan tehtävälistan fullstack-sovellus, jossa asiakassovelluksella luodut tehtävät tallennetaan Express-palvelimen tietokantaan. Palvelin on demoa varten rakennettu valmiiksi ja demon aihe keskittyy pääasiassa asiakassovellukseen ja Reactin **kontekstiin** (context), jolla sovelluksen **tila** (state) jaetaan komponenteille ilman propseja.

Demon jälkeen osaat:

- käyttää Reactin contextia tilan hallintaan
- tehdä **kontekstin "tarjoajan"** (context provider), jonka avulla kontekstissa hallittua tilan tietoja voidaan tarjota muille komponenteille

## 2. Kloonaus ja käynnistys

Ensin käynnistetään palvelin [server/README.md](server/README.md)-tiedoston ohjeilla. Palvelin jää käyntiin omaan terminaaliinsa.

Asiakasohjelma käynnistetään toisessa terminaalissa demon kansiosta:

```bash
cd client
npm install
npm run dev
```

Sovellus avataan selaimessa osoitteessa <http://localhost:3000>.

## 3. Projektin rakenne alussa

Vaiheittainen tutoriaali aloitetaan kansiosta, jossa on vain demon valmis `server`-kansio. Oma projekti aloitetaan kopioimalla `server`-kansio uuteen projektikansioon ilman `node_modules`-kansiota. Asiakasohjelma luodaan luvussa 4.2.

```text
demo-09/
└── server/
    ├── generated/
    │   └── prisma/
    ├── lib/
    │   └── prisma.ts
    ├── prisma/
    │   ├── migrations/
    │   │   ├── 20261002112006_init/
    │   │   │   └── migration.sql
    │   │   └── migration_lock.toml
    │   └── schema.prisma
    ├── routes/
    │   └── tehtavat.ts
    ├── .env
    ├── .gitignore
    ├── dev.db
    ├── index.ts
    ├── package-lock.json
    ├── package.json
    ├── prisma7.config.ts
    ├── README.md
    └── tsconfig.json
```

Tiedosto `.env` ja Prisman generoima `generated`-kansio syntyvät palvelimen käynnistysohjeen vaiheissa, koska ne on rajattu versionhallinnan ulkopuolelle palvelimen `.gitignore`-tiedostossa. Puusta on jätetty pois `generated/prisma`-kansion sisältö.

## 4. Demon vaiheittainen rakentaminen

Tästä eteenpäin ohjeistus keskittyy asiakassovelluksen rakentumiseen vaiheittain sillä oletuksella, että palvelin on alustettu toimivasti ja on käytössä.

### 4.1 Palvelimen käynnistäminen

Palvelin on valmis REST API, joka tallentaa tehtävät SQLite-tietokantaan Prisman avulla. Demo opettaa vain asiakasohjelman, joten palvelimen koodia ei muuteta. Palvelin käynnistetään ensin, koska asiakasohjelma hakee tehtävät palvelimelta heti käynnistyessään.

Palvelin käynnistetään [server/README.md](server/README.md)-tiedoston ohjeilla, minkä jälkeen palataan tähän ohjeeseen. Palvelin jää käyntiin omaan terminaaliinsa osoitteeseen <http://localhost:3009>.

Palvelimen reitit ovat polussa `/api/tehtavat`, ja ne on lueteltu tiedostossa [REFERENCE.md](REFERENCE.md). Jokaisella tehtävällä on kentät `id`, `nimi` ja `suoritettu`, jotka tulevat palvelimen Prisma-mallista `Tehtava`.

### 4.2 Asiakasohjelman luominen

Asiakasohjelma luodaan [client/README.md](client/README.md)-tiedoston ohjeilla, minkä jälkeen palataan tähän ohjeeseen [lukuun 4.3](#43-otsikko-komponentti). Ohjeessa projekti luodaan Viten pohjasta, siihen asennetaan MUI ja pohjasta poistetaan ylimääräiset tiedostot. Lisäksi kehityspalvelimen portiksi asetetaan 3000, ja sille määritellään välityspalvelin, joka ohjaa `/api`-alkuiset pyynnöt palvelimelle.

Ohjeen jälkeen kehityspalvelin on käynnissä osoitteessa <http://localhost:3000>, ja `App.tsx` sisältää tyhjän sivupohjan. Kehityspalvelin jätetään käyntiin, jolloin tallennetut muutokset päivittyvät selaimeen.

### 4.3 Otsikko-komponentti

Otsikoille tehdään ensin oma komponentti. Otsikot eivät käytä sovellukseen luotavaa kontekstia. `src`-kansioon luodaan kansio `components` ja sinne uusi tiedosto `Otsikko.tsx`:

```tsx
import { Typography } from '@mui/material';

interface Props {
  children: string;
  taso: "pieni" | "iso";
}

const Otsikko = ({ children, taso }: Props) => {
  return (
    <>
      {taso === "pieni" && <Typography variant="h6" sx={{ mb: 3}}>{children}</Typography>}
      {taso === "iso" && <Typography variant="h5" sx={{ mb: 3}}>{children}</Typography>}
    </>
  );
};

export default Otsikko;
```

Propsien tyypit määritellään `Props`-rajapinnalla. `children` on komponentin tagien väliin kirjoitettu teksti, ja `taso` voi olla vain `"pieni"` tai `"iso"`. Ehdollinen renderöinti valitsee, kumpi `Typography`-komponentti näytetään.

Otsikot lisätään `App.tsx`-tiedoston sivupohjaan:

```tsx
import { Container, CssBaseline, Stack } from '@mui/material';

import Otsikko from './components/Otsikko'; // uusi

const App = () => {

  return (
    <>
      <CssBaseline />
      <Container sx={{ m: 3}}>
        <Stack spacing={2}>

          <Otsikko taso="iso">Demo 9: Context API</Otsikko> {/* uusi */}
          <Otsikko taso="pieni">Tehtävälista</Otsikko> {/* uusi */}

        </Stack>
      </Container>
    </>
  );
};

export default App;
```

Selaimessa näkyvät nyt otsikot "Demo 9: Context API" ja "Tehtävälista".

### 4.4 Konteksti ja tarjoaja

Seuraavaksi keskitytään demon ydinasiaan eli kontekstin hallintaan. Sovelluksessa kontekstia käytetään välittämään tehtävälistan tehtävät eri komponenteille sekä hallitsemaan tehtävien muokkaamiseen käytettäviä MUI:n dialogeja.

Sovelluksen tehtäviä ja tehtävien hallinnan dialogien tilaa käyttävät useat komponentit. `App` avaa lisäysdialogin, `LisaaTehtava` lisää tehtävän, `Tehtavalista` näyttää tehtävät ja avaa poistodialogin, ja `PoistaTehtava` poistaa tehtävän. Jos tila olisi `App`-komponentissa, se pitäisi välittää propseina jokaiseen muuhun komponenttiin, ja `PoistaTehtava` saisi omat propsinsa vielä `Tehtavalista`-komponentin kautta. Tällaista propsien välittämistä komponenttitasolta toiselle kutsutaan **propsien ketjutukseksi** (prop drilling), jota suositellaan välttämään.

Konteksti jakaa sisältämänsä tiedot kaikille komponenteille, jotka ovat sen tarjoajan sisällä, eikä tähän tarvita erillisiä komponenttien propseja. Konteksti luodaan `createContext`-funktiolla, ja tarjoaja on komponentti, joka antaa kontekstille arvon. Tässä demossa tarjoaja `TehtavaProvider` säilyttää tehtävät, dialogien tilan ja funktiot, jotka kutsuvat palvelinta. Aiheesta lisää: [Reactin dokumentaatio kontekstista](https://react.dev/learn/passing-data-deeply-with-context).

`src`-kansioon luodaan kansio `context` ja sinne uusi tiedosto `TehtavaContext.tsx`:

```tsx
import { createContext, useEffect, useState } from 'react';

export interface Tehtava {
  id: number;
  nimi: string;
  suoritettu: boolean;
}

export interface PoistoDialogi {
  tehtava: Tehtava | null;
  auki: boolean;
}

export interface TehtavaKonteksti {
  tehtavat: Tehtava[];
  lisaysDialogi: boolean;
  setLisaysDialogi: (auki: boolean) => void;
  poistoDialogi: PoistoDialogi;
  setPoistoDialogi: (poistoDialogi: PoistoDialogi) => void;
  lisaaTehtava: (nimi: string) => void;
  vaihdaSuoritus: (tehtava: Tehtava) => void;
  poistaTehtava: (id: number) => void;
}

export const TehtavaContext = createContext<TehtavaKonteksti | null>(null);

interface Props {
  children: React.ReactNode;
}

export const TehtavaProvider = ({ children }: Props) => {

  const [tehtavat, setTehtavat] = useState<Tehtava[]>([]);
  const [lisaysDialogi, setLisaysDialogi] = useState<boolean>(false);
  const [poistoDialogi, setPoistoDialogi] = useState<PoistoDialogi>({
    tehtava: null,
    auki: false,
  });

  const lisaaTehtava = async (nimi: string): Promise<void> => {
    const vastaus = await fetch("/api/tehtavat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nimi }),
    });
    const uusiTehtava: Tehtava = await vastaus.json();

    setTehtavat((edelliset: Tehtava[]) => [...edelliset, uusiTehtava]);
  };

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

  const poistaTehtava = async (id: number): Promise<void> => {
    await fetch(`/api/tehtavat/${id}`, { method: "DELETE" });

    setTehtavat((edelliset: Tehtava[]) =>
      edelliset.filter((tehtava: Tehtava) => tehtava.id !== id)
    );
  };

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

  return (
    <TehtavaContext
      value={{
        tehtavat,
        lisaysDialogi,
        setLisaysDialogi,
        poistoDialogi,
        setPoistoDialogi,
        lisaaTehtava,
        vaihdaSuoritus,
        poistaTehtava,
      }}
    >
      {children}
    </TehtavaContext>
  );
};
```

Tiedoston alussa määritellään tyypit. `Tehtava` vastaa palvelimen `Tehtava`-mallin kenttiä, ja `PoistoDialogi` sisältää poistettavan tehtävän sekä tiedon siitä, onko poistodialogi auki. `TehtavaKonteksti` määrittelee kaiken, mitä konteksti jakaa komponenteille.

`createContext<TehtavaKonteksti | null>(null)` luo kontekstin. Tyyppiparametri määrää kontekstin arvon tyypin, ja `null` on oletusarvo, jonka komponentti saa, jos sen yläpuolella ei ole tarjoajaa. Oletusarvo käsitellään luvussa 4.5.

`TehtavaProvider` on tavallinen komponentti, jolla on tilamuuttujat `tehtavat`, `lisaysDialogi` ja `poistoDialogi`. Komponentti palauttaa `TehtavaContext`-elementin, jonka `value`-propsiin kootaan tilat, niiden päivitysfunktiot ja tehtäviä käsittelevät funktiot. Propsi `children` sisältää kaikki komponentit, jotka kirjoitetaan `TehtavaProvider`-tagien väliin. Ne renderöidään kontekstielementin sisälle, joten ne voivat lukea kontekstin arvon.

> [!NOTE]
> Reactin versiosta 19 alkaen kontekstia voidaan käyttää suoraan tarjoajana muodossa `<TehtavaContext value={...}>`. Vanhemmissa ohjeissa sama kirjoitetaan muodossa `<TehtavaContext.Provider value={...}>`.

Funktiot `lisaaTehtava`, `vaihdaSuoritus` ja `poistaTehtava` lähettävät pyynnön palvelimelle ja päivittävät sen jälkeen tilan. `lisaaTehtava` lisää palvelimen palauttaman tehtävän listan loppuun. `vaihdaSuoritus` lähettää tehtävän käänteisellä `suoritettu`-arvolla ja korvaa listasta tehtävän, jolla on sama `id`. `poistaTehtava` suodattaa poistetun tehtävän pois listasta. Koska tila päivitetään palvelimen vastauksen perusteella, listaa ei tarvitse hakea uudelleen jokaisen muutoksen jälkeen. Pyynnöt tehdään suhteellisiin osoitteisiin, kuten `/api/tehtavat`, jotka Viten välityspalvelin ohjaa palvelimelle.

Efekti hakee tehtävät palvelimelta, kun tarjoaja renderöidään ensimmäisen kerran, koska sen riippuvuuslista on tyhjä. Muuttuja `ignore` estää tilan asettamisen, jos efekti on siivottu ennen kuin vastaus saapuu. Kehitystilassa `StrictMode` suorittaa efektin kahdesti, joten ensimmäisen haun vastaus jätetään tällä tavalla huomiotta.

### 4.5 Oma hook kontekstin lukemiseen

Komponentit lukevat kontekstin `useContext`-hookilla, joka palauttaa lähimmän yläpuolella olevan tarjoajan `value`-arvon. Koska kontekstin tyyppi on `TehtavaKonteksti | null`, jokaisen komponentin pitäisi tarkistaa `null` ennen kuin se käyttää arvoa. Tarkistus kootaan yhteen paikkaan omaan hookiin `useTehtavat`, joka lisätään `TehtavaContext.tsx`-tiedoston loppuun. Samalla `useContext` lisätään tiedoston alun importtiin:

```tsx
import { createContext, useContext, useEffect, useState } from 'react'; // muutettu

export interface Tehtava {
  id: number;
  nimi: string;
  suoritettu: boolean;
}

export interface PoistoDialogi {
  tehtava: Tehtava | null;
  auki: boolean;
}

export interface TehtavaKonteksti {
  tehtavat: Tehtava[];
  lisaysDialogi: boolean;
  setLisaysDialogi: (auki: boolean) => void;
  poistoDialogi: PoistoDialogi;
  setPoistoDialogi: (poistoDialogi: PoistoDialogi) => void;
  lisaaTehtava: (nimi: string) => void;
  vaihdaSuoritus: (tehtava: Tehtava) => void;
  poistaTehtava: (id: number) => void;
}

export const TehtavaContext = createContext<TehtavaKonteksti | null>(null);

interface Props {
  children: React.ReactNode;
}

export const TehtavaProvider = ({ children }: Props) => {

  const [tehtavat, setTehtavat] = useState<Tehtava[]>([]);
  const [lisaysDialogi, setLisaysDialogi] = useState<boolean>(false);
  const [poistoDialogi, setPoistoDialogi] = useState<PoistoDialogi>({
    tehtava: null,
    auki: false,
  });

  const lisaaTehtava = async (nimi: string): Promise<void> => {
    const vastaus = await fetch("/api/tehtavat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nimi }),
    });
    const uusiTehtava: Tehtava = await vastaus.json();

    setTehtavat((edelliset: Tehtava[]) => [...edelliset, uusiTehtava]);
  };

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

  const poistaTehtava = async (id: number): Promise<void> => {
    await fetch(`/api/tehtavat/${id}`, { method: "DELETE" });

    setTehtavat((edelliset: Tehtava[]) =>
      edelliset.filter((tehtava: Tehtava) => tehtava.id !== id)
    );
  };

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

  return (
    <TehtavaContext
      value={{
        tehtavat,
        lisaysDialogi,
        setLisaysDialogi,
        poistoDialogi,
        setPoistoDialogi,
        lisaaTehtava,
        vaihdaSuoritus,
        poistaTehtava,
      }}
    >
      {children}
    </TehtavaContext>
  );
};

export const useTehtavat = (): TehtavaKonteksti => { // uusi

  const konteksti = useContext(TehtavaContext); // uusi

  if (!konteksti) { // uusi
    throw new Error("useTehtavat-hookia pitää käyttää TehtavaProviderin sisällä"); // uusi
  } // uusi

  return konteksti; // uusi
}; // uusi
```

`useTehtavat` palauttaa arvon tyypillä `TehtavaKonteksti`, joten sitä käyttävät komponentit saavat kaikki kentät ilman omaa `null`-tarkistusta. Jos hookia kutsutaan `TehtavaProvider`-komponentin ulkopuolella, se heittää virheen, jonka viesti kertoo, missä hookia pitää käyttää. Aiheesta lisää: [useContext](https://react.dev/reference/react/useContext).

Oman hookin nimi alkaa sanalla `use`, koska hookien sääntöjen mukaan vain komponentit ja `use`-alkuiset hookit saavat kutsua muita hookeja. Aiheesta lisää: [omat hookit](https://react.dev/learn/reusing-logic-with-custom-hooks).

### 4.6 Tarjoajan lisääminen sovellukseen

Kontekstia voivat lukea vain tarjoajan sisällä olevat komponentit. Tiedostossa `main.tsx` `App` kääritään `TehtavaProvider`-komponentin sisään, jolloin koko sovellus voi käyttää `useTehtavat`-hookia:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import App from './App.tsx'
import { TehtavaProvider } from './context/TehtavaContext' // uusi

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TehtavaProvider> {/* uusi */}
      <App />
    </TehtavaProvider> {/* uusi */}
  </StrictMode>,
)
```

Sivulla ei vielä näy muutosta. Selaimen kehitystyökalujen Network-välilehdellä näkyvät kuitenkin tarjoajan efektin pyynnöt osoitteeseen `/api/tehtavat`.

### 4.7 Poistodialogi

Poistodialogi tehdään ennen tehtävälistaa, koska lista renderöi sen. `components`-kansioon luodaan uusi tiedosto `PoistaTehtava.tsx`:

```tsx
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTehtavat } from '../context/TehtavaContext';

const PoistaTehtava = () => {

  const { poistoDialogi, setPoistoDialogi, poistaTehtava } = useTehtavat();

  const suljeDialogi = (): void => {
    setPoistoDialogi({ ...poistoDialogi, auki: false });
  };

  const kasittelePoisto = (): void => {
    if (poistoDialogi.tehtava) {
      poistaTehtava(poistoDialogi.tehtava.id);
    }
    suljeDialogi();
  };

  return (
    <Dialog
      open={poistoDialogi.auki}
      onClose={suljeDialogi}
      fullWidth
      slotProps={{ paper: { sx: { position: "fixed", top: 100 } } }}
    >
      <DialogTitle>Poista tehtävä</DialogTitle>
      <DialogContent>
        <Typography>
          Haluatko varmasti poistaa tehtävän: "{poistoDialogi.tehtava?.nimi}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={kasittelePoisto}>Poista</Button>
        <Button onClick={suljeDialogi}>Peruuta</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PoistaTehtava;
```

Komponentti saa kaikki tarvitsemansa arvot `useTehtavat`-hookilla, joten sillä ei ole propseja. Dialogi on auki, kun `poistoDialogi.auki` on `true`, ja se näyttää poistettavan tehtävän nimen. Poista-painike poistaa tehtävän ja sulkee dialogin. Peruuta-painike, Esc-näppäin ja dialogin ulkopuolelle klikkaaminen sulkevat dialogin poistamatta tehtävää. `slotProps`-propsilla dialogi kiinnitetään 100 pikselin päähän sivun yläreunasta.

### 4.8 Tehtävälista

`components`-kansioon luodaan uusi tiedosto `Tehtavalista.tsx`:

```tsx
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteIcon from '@mui/icons-material/Delete';

import PoistaTehtava from './PoistaTehtava';
import { useTehtavat, type Tehtava } from '../context/TehtavaContext';

const Tehtavalista = () => {

  const { tehtavat, setPoistoDialogi, vaihdaSuoritus } = useTehtavat();

  return (
    <>
      <List>
        {tehtavat.map((tehtava: Tehtava) => (
          <ListItem
            key={tehtava.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="Poista tehtävä"
                onClick={() => setPoistoDialogi({ tehtava, auki: true })}
              >
                <DeleteIcon />
              </IconButton>
            }
          >

            <ListItemIcon>
              <IconButton
                aria-label="Merkitse suoritetuksi"
                onClick={() => vaihdaSuoritus(tehtava)}
              >
                {tehtava.suoritettu
                  ? <CheckBoxIcon />
                  : <CheckBoxOutlineBlankIcon />
                }
              </IconButton>
            </ListItemIcon>

            <ListItemText primary={tehtava.nimi} />

          </ListItem>
        ))}
      </List>

      <PoistaTehtava />
    </>
  );
};

export default Tehtavalista;
```

Lista renderöidään `tehtavat`-taulukosta `map`-metodilla. Rivin vasemman reunan painike kutsuu `vaihdaSuoritus`-funktiota, ja sen kuvake näyttää, onko tehtävä suoritettu. Oikean reunan roskakoripainike avaa poistodialogin asettamalla kontekstiin poistettavan tehtävän ja arvon `auki: true`. Painike ja dialogi ovat eri komponenteissa, mutta ne käyttävät samaa tilaa kontekstin kautta.

`Tehtava`-tyyppi tuodaan `type`-avainsanalla, koska `tsconfig.app.json`-tiedoston asetus `verbatimModuleSyntax` vaatii pelkkien tyyppien tuonnit näin.

### 4.9 Lisäysdialogi

`components`-kansioon luodaan uusi tiedosto `LisaaTehtava.tsx`:

```tsx
import { useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { useTehtavat } from '../context/TehtavaContext';

const LisaaTehtava = () => {

  const { lisaysDialogi, setLisaysDialogi, lisaaTehtava } = useTehtavat();

  const nimiRef = useRef<HTMLInputElement>(null);

  const kasitteleLisays = (): void => {
    lisaaTehtava(nimiRef.current?.value || "(nimetön tehtävä)");
    setLisaysDialogi(false);
  };

  return (
    <Dialog
      open={lisaysDialogi}
      onClose={() => setLisaysDialogi(false)}
      fullWidth
      slotProps={{ paper: { sx: { position: "fixed", top: 100 } } }}
    >
      <DialogTitle>Lisää uusi tehtävä</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={nimiRef}
          variant="outlined"
          label="Tehtävän nimi"
          fullWidth
          sx={{ marginTop: "10px" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={kasitteleLisays}>Lisää</Button>
        <Button onClick={() => setLisaysDialogi(false)}>Peruuta</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LisaaTehtava;
```

Dialogin avaa `App`-komponentin painike, joka tehdään luvussa 4.10. Tekstikentän arvo luetaan vasta, kun Lisää-painiketta painetaan. `useRef`-hookilla luotu viittaus liitetään kentän input-elementtiin MUI:n `inputRef`-propsilla, ja arvo luetaan viittauksen kautta. Jos kenttä on tyhjä, tehtävän nimeksi tulee `(nimetön tehtävä)`.

### 4.10 Komponenttien kokoaminen App-komponenttiin

Lopuksi `App`-komponenttiin lisätään painike, joka avaa lisäysdialogin, sekä tehtävälista ja lisäysdialogi:

```tsx
import { Button, Container, CssBaseline, Stack } from '@mui/material'; // muutettu

import LisaaTehtava from './components/LisaaTehtava'; // uusi
import Otsikko from './components/Otsikko';
import Tehtavalista from './components/Tehtavalista'; // uusi
import { useTehtavat } from './context/TehtavaContext'; // uusi

const App = () => {

  const { setLisaysDialogi } = useTehtavat(); // uusi

  return (
    <>
      <CssBaseline />
      <Container sx={{ m: 3}}>
        <Stack spacing={2}>

          <Otsikko taso="iso">Demo 9: Context API</Otsikko>
          <Otsikko taso="pieni">Tehtävälista</Otsikko>

          <Button variant="contained" onClick={() => setLisaysDialogi(true)}> {/* uusi */}
            Lisää uusi tehtävä {/* uusi */}
          </Button> {/* uusi */}

          <Tehtavalista /> {/* uusi */}

          <LisaaTehtava /> {/* uusi */}

        </Stack>
      </Container>
    </>
  );
};

export default App;
```

`App` hakee `useTehtavat`-hookilla vain `setLisaysDialogi`-funktion. `Tehtavalista` ja `LisaaTehtava` renderöidään ilman propseja, koska ne lukevat tarvitsemansa arvot kontekstista.

## 5. Sovelluksen testaaminen

1. Palvelin on käynnissä [server/README.md](server/README.md)-tiedoston ohjeiden mukaisesti, ja asiakasohjelman kehityspalvelin käynnistetään `client`-kansiossa komennolla `npm run dev`.
2. Selaimessa avataan osoite <http://localhost:3000>. Listassa näkyvät tietokannassa valmiiksi olevat tehtävät.
3. Lisää uusi tehtävä -painike avaa lisäysdialogin. Kenttään kirjoitetaan nimi, ja Lisää-painike lisää tehtävän listan loppuun. Peruuta-painike sulkee dialogin lisäämättä tehtävää.
4. Dialogi avataan uudelleen ja Lisää-painiketta painetaan tyhjällä kentällä. Listaan tulee tehtävä nimeltä "(nimetön tehtävä)".
5. Tehtävän vasemmalla puolella olevaa valintaruutua klikataan, jolloin ruutuun tulee valintamerkki. Toinen klikkaus poistaa merkin.
6. Tehtävän roskakorikuvake avaa poistodialogin, jossa näkyy tehtävän nimi. Peruuta-painike sulkee dialogin, ja tehtävä jää listaan. Poista-painike poistaa tehtävän listasta.
7. Sivu ladataan uudelleen. Muutokset näkyvät edelleen, koska ne on tallennettu palvelimen tietokantaan.

## 6. Projektin rakenne lopussa

```text
demo-09/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LisaaTehtava.tsx
│   │   │   ├── Otsikko.tsx
│   │   │   ├── PoistaTehtava.tsx
│   │   │   └── Tehtavalista.tsx
│   │   ├── context/
│   │   │   └── TehtavaContext.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── server/
```

`server`-kansio on sama kuin luvussa 3, joten sen sisältö on jätetty puusta pois.

## 7. Yhteenveto

Demossa rakennettiin tehtävälista, jonka tehtävät ja dialogien tila jaetaan komponenteille kontekstin avulla. Tila ja palvelinkutsut ovat yhdessä tarjoajassa, ja komponentit lukevat ne omalla hookilla ilman propseja. Samaa rakennetta voidaan käyttää muuhunkin tilaan, jota useat erilliset komponentit tarvitsevat.

---

## 8. Jatka harjoittelua

1. Otsikoiden alle tehdään komponentti, joka näyttää, montako tehtävää on suoritettu kaikista tehtävistä. Vihje: komponentti saa `tehtavat`-taulukon `useTehtavat`-hookilla, joten `App`-komponentin ei tarvitse välittää sille propseja.
2. Tehtävälistan riville lisätään muokkauspainike, joka avaa dialogin tehtävän nimen muuttamista varten. Vihje: palvelimen `PUT /api/tehtavat/:id` -reitti päivittää sekä `nimi`- että `suoritettu`-kentän, joten pyynnössä lähetetään koko tehtävä uudella nimellä samaan tapaan kuin `vaihdaSuoritus`-funktiossa. Dialogin tila voidaan tehdä kontekstiin samalla mallilla kuin `poistoDialogi`.
3. Tarjoajan funktiot eivät tarkista, onnistuiko pyyntö. Kontekstiin lisätään virhetila, joka asetetaan, kun `vastaus.ok` on `false`, ja `App` näyttää virheen MUI:n `Alert`-komponentilla. Vihje: virhetilannetta voi kokeilla pysäyttämällä palvelimen.
