import express, { type Application, type Request, type Response } from 'express';
import { prisma } from './prisma';

// Luodaan Express-palvelin
const app: Application = express();

// Portti on aina numero. Käytetään ympäristömuuttujissa määriteltyä porttia (process.env.PORT) tai 3001
const port: number = Number(process.env.PORT) || 3001;

// Määritetään palvelimen näkymämoottori käyttämään ejs:ää
app.set("view engine", "ejs");

// Käsittelijä palvelimen juureen. Tulostaa views-kansion index.ejs -tiedoston tietokannasta haetuilla ostoksilla
app.get("/", async (req: Request, res: Response) => {
    const ostokset = await prisma.ostos.findMany();
    res.render("index", { ostokset : ostokset });
});

app.listen(port, () => {
    console.log(`Palvelin avattiin osoitteeseen: http://localhost:${port}`);
});