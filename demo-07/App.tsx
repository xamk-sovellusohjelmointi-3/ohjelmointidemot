import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import { Appbar, Button, Dialog, IconButton, List, MD3LightTheme, PaperProvider, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';

interface Ostos {
    id: number;
    tuote: string;
}

interface DialogiData {
    auki: boolean;
    teksti: string;
}

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

function Ostoslista() {

    const db = useSQLiteContext();
    const theme = useTheme();
    const [dialogi, setDialogi] = useState<DialogiData>({ auki: false, teksti: "" });
    const [ostokset, setOstokset] = useState<Ostos[]>([]);

    const haeOstokset = async (): Promise<void> => {
        const rivit = await db.sql<Ostos>`SELECT * FROM ostokset ORDER BY id`;
        setOstokset(rivit);
    };

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

    useEffect(() => {
        haeOstokset();
    }, []);

    return (
        <>
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

            </ScrollView>

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
        </>
    );
}
