import { StatusBar } from 'expo-status-bar';
import { View, Vibration } from 'react-native';
import { Appbar, Button, List, MD3LightTheme, PaperProvider } from 'react-native-paper';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';

export default function App() {

    const akkulataus = Battery.useBatteryLevel();
    const akunTila = Battery.useBatteryState();

    const latauksessa = (akunTila === Battery.BatteryState.CHARGING || akunTila === Battery.BatteryState.FULL)
        ? 'Kyllä'
        : 'Ei';

    return (
        <PaperProvider theme={MD3LightTheme}>
            <Appbar.Header>
                <Appbar.Content title="Demo 5: Laitekomponentit" />
                <Appbar.Action icon="atom" />
            </Appbar.Header>
            <View style={{ marginHorizontal: 10 }}>

                <List.Accordion
                    title="Perustietoja laitteesta"
                    left={props => <List.Icon {...props} icon="memory" />}
                >
                    <List.Item title="Merkki" description={Device.brand ?? 'Ei saatavilla'} />
                    <List.Item title="Malli" description={Device.modelName ?? 'Ei saatavilla'} />
                    <List.Item title="Käyttöjärjestelmä" description={Device.osName ?? 'Ei saatavilla'} />
                    <List.Item title="Versio" description={Device.osVersion ?? 'Ei saatavilla'} />
                </List.Accordion>

                <List.Accordion
                    title="Akkutietoja"
                    left={props => <List.Icon {...props} icon="battery" />}
                >
                    <List.Item
                        title="Latauksen määrä"
                        description={akkulataus >= 0 ? `${(100 * akkulataus).toFixed(2)} %` : 'Ei saatavilla'}
                    />
                    <List.Item title="Latauksessa" description={latauksessa} />
                </List.Accordion>

                <Button
                    style={{ marginVertical: 10 }}
                    mode="contained"
                    onPress={() => Vibration.vibrate(2000)}
                    icon="vibrate"
                >Värinää!</Button>

                <StatusBar style="dark" />
            </View>
        </PaperProvider>
    );
}
