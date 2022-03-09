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
// app.get('/items/:id', async (req, res) => {
//     const itemToSend = await item.findUnique({
//         where: { id: +req.params.id.toLowerCase() },
//         include: { boughtBy: { select: { User: true, quantity: true } } },
//     });
//     if(!itemToSend)return res.send(`Item with id '${req.params.id}' doesn't exist.`)
//     res.send(itemToSend);
// });
app.get('/items/:title', async (req, res) => {
    const itemToSend = await item.findUnique({
        where: { title: req.params.title.toLowerCase() },
        include: { boughtBy: { select: { User: true, quantity: true } } },
    });
    if (!itemToSend)
        return res.send(
            `Item with title '${req.params.title.toLowerCase()}' doesn't exist.`
        );
    res.send(itemToSend);
});

//users
app.get('/users', async (req, res) => {
    res.send(
        await user.findMany({
            include: {
                itemsOrdered: { select: { Item: true, quantity: true } },
            },
        })
    );
});

app.get('/users/:email', async (req, res) => {
    const userToSend = await user.findUnique({
        where: { email: req.params.email.toLowerCase() },
        include: { itemsOrdered: { select: { Item: true, quantity: true } } },
    });
    if (!userToSend)
        return res.send(
            `User with email '${req.params.email.toLowerCase()}' doesn't exist.`
        );
    res.send(userToSend);
});

app.patch('/users/:id', async (req, res) => {
    const id = +req.params.id;
    const { name, email } = req.body;
    const foundUser = await user.findFirst({ where: { id } });
    if (!foundUser)
        return res.status(404).send(`A user with id '${id}' doesn't exist.`);

    res.send(
        await user.update({
            data: {
                name: name ?? foundUser.name,
                email: email ?? foundUser.email,
            },
            where: { id },
        })
    );
});
// app.get('/users/:id', async (req, res) => {
//     const userToSend = await user.findUnique({
//         where: { id: +req.params.id.toLowerCase() },
//         include: { itemsOrdered: { select: { Item: true, quantity: true } } },
//     });
//     if(!userToSend)return res.send(`User with id '${req.params.id}' doesn't exist.`)
//     res.send(userToSend);
// });

app.post('/create-item', async (req, res) => {
    const { title, image } = req.body;
    try {
        res.send(
            await item.create({
                data: {
                    image: image.toLowerCase(),
                    title: title.toLowerCase(),
                },
            })
        );
    } catch (error) {
        res.status(400).send(error);
    }
});
//orders
app.post('/create-order', async (req, res) => {
    const { email, title, quantity } = req.body;
    // const foundOrder = await order.findFirst({
    //     where: {
    //         User: { email: { equals: email } },
    //         AND: { Item: { title: { equals: title } } },
    //     },
    // });
    // console.log(foundOrder)
    // if (foundOrder) {
    //     return res.status(400).send('Order already exists.');
    // }
    try {
        const createdOrder = await order.create({
            data: {
                Item: { connect: { title: title.toLowerCase() } },
                User: { connect: { email: email.toLowerCase() } },
                quantity,
            },
        });
        res.send(createdOrder);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.post('/remove-order', async (req, res) => {
    const { userId, itemId } = req.body;
    try {
        res.send(
            await order.delete({ where: { userId_itemId: { itemId, userId } } })
        );
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(3009, () => {
    console.log(`Server started on http://localhost:3009`);
});
