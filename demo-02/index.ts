import express, { type Application, type Request, type Response } from 'express';
import { prisma } from './prisma';

// Luodaan Express-palvelin
const app: Application = express();

// Portti on aina numero. Käytetään ympäristömuuttujissa määriteltyä porttia (process.env.PORT) tai 3001
const port: number = Number(process.env.PORT) || 3002;

// Määritetään palvelimen näkymämoottori käyttämään ejs:ää
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/poista", async (req: Request, res: Response) => {
    await prisma.ostos.delete({
        where: {
            id: Number(req.body.id)
        }
    });

    res.redirect("/");
});

app.post("/", async (req : express.Request, res : express.Response) => {
    await prisma.ostos.create({
        data : {
            tuote : req.body.tuote || "Nimetön tuote",
            poimittu : false
        }
    });

    let ostokset = await prisma.ostos.findMany();
    res.render("index", { ostokset : ostokset });
});

app.get("/poimittu", async (req : express.Request, res : express.Response) => {
    await prisma.ostos.update({
        where : {
            id : Number(req.query.id)
        },
        data : {
            poimittu : (req.query.poimittu === "true" ) ? false : true
        }
    });

    res.redirect("/");
});

app.get("/", async (req : express.Request, res : express.Response) => {
    let ostokset = await prisma.ostos.findMany();
    res.render("index", { ostokset : ostokset });
});

// Palvelimen käynnistäminen
app.listen(port, () => {
    console.log(`Palvelin avattiin osoitteeseen: http://localhost:${port}`);
});