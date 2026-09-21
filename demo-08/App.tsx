import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {

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

    return (
        <View style={styles.container}>

            {virhe
                ? <Text>{virhe}</Text>
                : !sijainti
                    ? <Text>Haetaan sijaintia...</Text>
                    : <>
                        <Text style={styles.teksti}>Leveysaste: {sijainti.coords.latitude.toFixed(5)}</Text>
                        <Text style={styles.teksti}>Pituusaste: {sijainti.coords.longitude.toFixed(5)}</Text>
                    </>
            }

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
    teksti: {
        fontSize: 18,
        marginVertical: 5,
    },
});
