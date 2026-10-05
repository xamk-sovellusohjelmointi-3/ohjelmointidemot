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
