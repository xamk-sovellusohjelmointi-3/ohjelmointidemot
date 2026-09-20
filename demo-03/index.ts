import express, { type Application, type RequestHandler, type Request, type Response } from "express";
import path from "path";
import { prisma } from "./lib/prisma";
import multer, { MulterError } from "multer";
import fs from "fs/promises";

const app: Application = express();
const port: number = Number(process.env.PORT) || 3003;

const uploadHandler: RequestHandler = multer({
    dest: path.join(import.meta.dirname, "tmp"),
    limits: {
        fileSize: (1024 * 1024 * 0.5), // Sallitaan alle 500kt tiedostot
    },
    fileFilter: (req, file, callback,) => {
        const sallitutKuvaTyypit = ["image/jpeg", "image/gif"];

        if (sallitutKuvaTyypit.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error());
        }
    }
}).single("tiedosto");

app.set("view engine", "ejs");
app.use(express.static(path.resolve(import.meta.dirname, "public")));

app.post("/lataa", async (req: Request, res: Response): Promise<void> => {

        uploadHandler(req, res, async (err: any) => {

            if (err instanceof MulterError) {

                res.render("lataa", {
                    virhe: "Tiedosto on tiedostokooltaan liian suuri (> 500kt).",
                    teksti: req.body.teksti,
                });
            } else if (err) {

                res.render("lataa", {
                    virhe: "Väärä tiedostomuoto. Käytä ainoastaan jpg/jpeg/gif-kuvia",
                    teksti: req.body.teksti,
                });
            } else {
                if (req.file) {
                    let tiedostonimi: string = `${req.file.filename}.jpeg`;

                    await fs.copyFile(
                        path.resolve(import.meta.dirname, "tmp", req.file.filename),
                        path.resolve(import.meta.dirname, "public", "img", tiedostonimi),
                    );

                    await prisma.kuva.create({
                        data: {
                            teksti: req.body.teksti || "Nimetön kuva",
                            tiedosto: tiedostonimi,
                        },
                    });
                }
                res.redirect("/");
            }
        });
});

app.get("/lataa", (req: Request, res: Response): void => {
    res.render("lataa", { virhe: "", teksti: "" });
});

app.get("/", async (req: Request, res: Response): Promise<void> => {
        res.render("index", {kuvat: await prisma.kuva.findMany()});
    },
);

app.listen(port, (): void => {
    console.log(`Palvelin käynnistettiin osoitteeseen: http://localhost:${port}`);
});
