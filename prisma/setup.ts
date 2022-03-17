import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

const users: Prisma.UserCreateInput[] = [
    {
        name: 'Nicolas',
        email: 'nicolas@email.com',
        password: bcrypt.hashSync('test123', 8),
    },
    {
        name: 'Rinor',
        email: 'rinor@email.com',
        password: bcrypt.hashSync('test123', 8),
    },
    {
        name: 'Arita',
        email: 'arita@email.com',
        password: bcrypt.hashSync('test123', 8),
    },
];

const items: Prisma.ItemCreateInput[] = [
    {
        title: 'Laptop',
        image: 'laptop.jpg',
        price: 18.99,
    },
    {
        title: 'Bicycle',
        image: 'bicycle.jpg',
        price: 9.99,
    },
    {
        title: 'Car',
        image: 'car.jpg',
        price: 14.99,
    },
    {
        title: 'Table',
        image: 'table.jpg',
        price: 4.99,
    },
    {
        title: 'Shelf',
        image: 'shelf.jpg',
        price: 30.99,
    },
    {
        title: 'Bed',
        image: 'bed.jpg',
        price: 50.99,
    },
];
const orders: Prisma.OrderCreateInput[] = [
    {
        quantity: 2,
        Item: { connect: { title: 'bed' } },
        User: { connect: { email: 'nicolas@email.com' } },
    },
    {
        quantity: 5,
        Item: { connect: { title: 'car' } },
        User: { connect: { email: 'arita@email.com' } },
    },
    {
        quantity: 7,
        Item: { connect: { title: 'shelf' } },
        User: { connect: { email: 'rinor@email.com' } },
    },
    {
        quantity: 1,
        Item: { connect: { title: 'table' } },
        User: { connect: { email: 'nicolas@email.com' } },
    },
    {
        quantity: 10,
        Item: { connect: { title: 'bicycle' } },
        User: { connect: { email: 'arita@email.com' } },
    },
    {
        quantity: 20,
        Item: { connect: { title: 'laptop' } },
        User: { connect: { email: 'rinor@email.com' } },
    },
    {
        quantity: 13,
        Item: { connect: { title: 'car' } },
        User: { connect: { email: 'nicolas@email.com' } },
    },
    {
        quantity: 17,
        Item: { connect: { title: 'bed' } },
        User: { connect: { email: 'rinor@email.com' } },
    },
];

async function setupData() {
    // for (let { name, email } of users) {
    //     await prisma.user.create({
    //         data: {
    //             name,
    //             email,
    //             itemsOrdered: {
    //                 create: [
    //                     {
    //                         quantity: 3,
    //                         Item: {
    //                             create: {
    //                                 title: 'asd',
    //                                 image: 'asdasd',
    //                             },
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     });
    // }
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.item.deleteMany();

    for (const user of users) {
        user.name = user.name.toLowerCase();
        user.email = user.email.toLowerCase();
        await prisma.user.create({ data: user });
    }
    for (const item of items) {
        item.title = item.title.toLowerCase();
        item.image = item.image.toLowerCase();
        await prisma.item.create({ data: item });
    }
    for (const order of orders) {
        await prisma.order.create({ data: order });
    }
}

setupData();
