import { StatusBar } from 'expo-status-bar';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Appbar, Card, FAB, MD3LightTheme, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useRef, useState } from 'react';

interface Kuvaustiedot {
    kuvaustila: boolean;
    virhe: string;
    info: string;
}

interface OtettuKuva {
    uri: string;
    aikaleima: Date;
}

export default function App() {

    const [kameraLupa, pyydaKameraLupa] = useCameraPermissions();
    const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
        kuvaustila: false,
        virhe: "",
        info: ""
    });
    const [kameraValmis, setKameraValmis] = useState<boolean>(false);
    const [kuvat, setKuvat] = useState<OtettuKuva[]>([]);
    const kameraRef = useRef<CameraView>(null);

    const kaynnistaKamera = async () => {
        const lupa = kameraLupa?.granted ? kameraLupa : await pyydaKameraLupa();
        setKameraValmis(false);
        setKuvaustiedot((edellinen) => ({
            ...edellinen,
            kuvaustila: lupa.granted,
            virhe: (!lupa.granted) ? "Ei lupaa kameran käyttöön." : ""
        }));
    }

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

    const aloitusNakyma = () => {
        return (
            <>
                <Appbar.Header>
                    <Appbar.Content title="Demo 6: Kamera" />
                    <Appbar.Action
                        icon="camera"
                        onPress={kaynnistaKamera}
                    />
                </Appbar.Header>

                {(Boolean(kuvaustiedot.virhe))
                    ? <Text style={styles.virhe}>{kuvaustiedot.virhe}</Text>
                    : null
                }

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

                <StatusBar style="dark" />
            </>
        );
    }

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

    return (
        <PaperProvider theme={MD3LightTheme}>
            {!kuvaustiedot.kuvaustila ? aloitusNakyma() : kameraNakyma()}
        </PaperProvider>
    );

}

const styles = StyleSheet.create({
    kuvaustila: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    kameranPainikkeet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nappi: {
        margin: 20,
    },
    lista: {
        padding: 10,
    },
    kortti: {
        marginBottom: 12,
    },
    korttiKuva: {
        width: '100%',
        aspectRatio: 3 / 4,
    },
    aikaleima: {
        marginTop: 8,
        color: '#666',
    },
    virhe: {
        margin: 10,
        color: 'red',
    },
    tyhjaLista: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
    },
});
