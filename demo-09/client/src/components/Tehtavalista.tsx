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
