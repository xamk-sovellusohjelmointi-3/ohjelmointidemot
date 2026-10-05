import express from "express";
import tehtavatRouter from './routes/tehtavat';

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3009;

app.use(express.json());
app.use('/api/tehtavat', tehtavatRouter);

app.listen(port, (): void => {
    console.log(`Palvelin käynnistettiin osoitteeseen: http://localhost:${port}`);
});
