import express from 'express';
import cors from 'cors';
import bcrypt, { compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import 'dotenv/config';

import { prisma, Prisma, PrismaClient } from '@prisma/client';
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
app.use(cookieParser());
app.use(express.json());

// items
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
    if (!itemToSend) {
        return res.send(
            `Item with title '${req.params.title.toLowerCase()}' doesn't exist.`
        );
    }
    res.send(itemToSend);
});

// users

app.post(`/sign-up`, async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // const existingUser = await user.findUnique({ where: { email } });
        const hashedPassword = bcrypt.hashSync(password, 10);

        const createdUser = await user.create({
            data: { email, name, password: hashedPassword },
        });
        //@ts-ignore
        const token = jwt.sign({ id: createdUser.id }, process.env.SECRET);
        res.cookie('token', token, { maxAge: 900000 });
        return res.send({
            user: createdUser,
        });
    } catch (error) {
        res.status(409).send({ error: 'User already exists or missing data.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const dbUser = await user.findFirst({
            where: { email },
            include: { itemsOrdered: { include: { Item: true } } },
        });
        // @ts-ignore
        const passwordMatches = bcrypt.compareSync(password, dbUser.password);

        if (passwordMatches) {
            // @ts-ignore
            const token = jwt.sign({ id: dbUser.id }, process.env.SECRET);
            res.cookie('token', token, { maxAge: 90000000 });
            return res.send({
                user: dbUser,
            });
        }
        throw Error;
    } catch (error) {
        return res
            .status(400)
            .send({ error: `Email/password incorrect or user doesn't exist` });
    }
});
// app.get('/users', async (req, res) => {
//     res.cookie('token', 'sdfsdfsdf');
//     res.send({ message: 'test' });
// });

app.get('/validate', async (req, res) => {
    const token = req.headers.authorization || '';
    // @ts-ignore
    const decodedData = jwt.verify(token, process.env.SECRET);

    const userToSend = await user.findUnique({
        where: { id: decodedData.id },
        include: { itemsOrdered: { include: { Item: true } } },
    });

    if (!userToSend) return res.send(`Please log in again.`);
    res.send(userToSend);
});

app.patch('/users/:id', async (req, res) => {
    const id = +req.params.id;
    const { name, email } = req.body;
    const foundUser = await user.findFirst({ where: { id } });
    if (!foundUser) {
        return res.status(404).send(`A user with id '${id}' doesn't exist.`);
    }

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
app.get('/users/id/:id', async (req, res) => {
    const userToSend = await user.findUnique({
        where: { id: +req.params.id.toLowerCase() },
        include: { itemsOrdered: { select: { Item: true, quantity: true } } },
    });
    if (!userToSend) {
        return res.send(`User with id '${req.params.id}' doesn't exist.`);
    }
    res.send(userToSend);
});

app.post('/create-item', async (req, res) => {
    const { title, image, price } = req.body;
    try {
        res.send(
            await item.create({
                data: {
                    image: image.toLowerCase(),
                    title: title.toLowerCase(),
                    price,
                },
            })
        );
    } catch (error) {
        res.status(400).send(error);
    }
});
// orders
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
        res.send(
            await user.findFirst({
                where: { id: createdOrder.userId },
                include: { itemsOrdered: { include: { Item: true } } },
            })
        );
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

app.post('/update-quantity', async (req, res) => {
    const { userId, itemId, quantity } = req.body;
    await order.update({
        data: { quantity },
        where: { userId_itemId: { itemId, userId } },
    });
    res.send(
        await user.findFirst({
            where: { id: userId },
            include: { itemsOrdered: { include: { Item: true } } },
        })
    );
});

app.listen(3009, () => {
    console.log(`Server started on http://localhost:3009`);
});
