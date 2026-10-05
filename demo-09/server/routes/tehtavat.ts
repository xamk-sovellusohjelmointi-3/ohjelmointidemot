import express, { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';

const tehtavatRouter = express.Router();

tehtavatRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
    res.json(await prisma.tehtava.findMany());
});

tehtavatRouter.post('/', async (req: Request, res: Response): Promise<void> => {
    const uusiTehtava = await prisma.tehtava.create({
        data: {
            nimi: req.body.nimi
        }
    });

    res.json(uusiTehtava);
});

tehtavatRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const paivitettyTehtava = await prisma.tehtava.update({
        where: {
            id: Number(req.params.id)
        },
        data: {
            nimi: req.body.nimi,
            suoritettu: req.body.suoritettu
        }
    });

    res.json(paivitettyTehtava);
});

tehtavatRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    const poistettuTehtava = await prisma.tehtava.delete({
        where: {
            id: Number(req.params.id)
        }
    });

    res.json(poistettuTehtava);
});

export default tehtavatRouter;