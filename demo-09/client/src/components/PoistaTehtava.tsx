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
