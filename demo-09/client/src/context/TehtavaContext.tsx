import { createContext, useContext, useEffect, useState } from 'react';

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

export const useTehtavat = (): TehtavaKonteksti => {

  const konteksti = useContext(TehtavaContext);

  if (!konteksti) {
    throw new Error("useTehtavat-hookia pitää käyttää TehtavaProviderin sisällä");
  }

  return konteksti;
};
