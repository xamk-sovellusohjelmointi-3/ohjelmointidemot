import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

    const [nimi, setNimi] = useState<string>('');
    const [tervehdys, setTervehdys] = useState<string>('');

    const sanoHeippa = () => {
        setTervehdys(`Heippa ${nimi}!`);
        setNimi('');
    };

    return (
        <SafeAreaView style={styles.container}>

            <Text style={{ fontSize: 20 }}>Demo 4: React Native -perusteita</Text>

            <Text style={styles.alaotsikko}>Hello world</Text>

            <TextInput
                style={styles.tekstikentta}
                placeholder="Anna nimesi..."
                value={nimi}
                onChangeText={(teksti) => setNimi(teksti)}
            />

            <Button
                title="Sano heippa"
                onPress={sanoHeippa}
            />

            {Boolean(tervehdys) && <Text style={styles.tervehdys}>{tervehdys}</Text>}

            <StatusBar style="auto" />

        </SafeAreaView>
    );
}

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
    tekstikentta: {
        marginBottom: 20,
    },
    tervehdys: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 20,
    },
});
