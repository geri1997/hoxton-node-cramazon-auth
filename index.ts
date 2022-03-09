import express from 'express';
import cors from 'cors';
import { Prisma, PrismaClient } from '@prisma/client';
const { user, item, order } = new PrismaClient({
    log: ['query'],
});

const app = express();
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'PATCH', 'POST', 'DELETE', 'HEAD', 'OPTIONS', 'PUT'],
    })
);
app.use(express.json());
//items
app.get('/items', async (req, res) => {
    res.send(
        await item.findMany({
            include: { boughtBy: { select: { User: true, quantity: true } } },
        })
    );
});

app.get('/items/:title', async (req, res) => {
    const itemToSend = await item.findUnique({
        where: { title: req.params.title },
        include: { boughtBy: { select: { User: true, quantity: true } } },
    });
    if(!itemToSend)return res.send(`Item with title '${req.params.title}' doesn't exist.`)
    res.send(itemToSend);
});

app.listen(3009, () => {
    console.log(`Server started on http://localhost:3009`);
});
