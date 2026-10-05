import { Button, Container, CssBaseline, Stack } from '@mui/material';

import LisaaTehtava from './components/LisaaTehtava';
import Otsikko from './components/Otsikko';
import Tehtavalista from './components/Tehtavalista';
import { useTehtavat } from './context/TehtavaContext';

const App = () => {

  const { setLisaysDialogi } = useTehtavat();

  return (
    <>
      <CssBaseline />
      <Container sx={{ m: 3}}>
        <Stack spacing={2}>

          <Otsikko taso="iso">Demo 9: Context API</Otsikko>
          <Otsikko taso="pieni">Tehtävälista</Otsikko>

          <Button variant="contained" onClick={() => setLisaysDialogi(true)}>
            Lisää uusi tehtävä
          </Button>

          <Tehtavalista />

          <LisaaTehtava />

        </Stack>
      </Container>
    </>
  );
};

export default App;
