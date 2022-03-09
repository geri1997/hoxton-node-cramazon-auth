import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users: Prisma.UserCreateInput[] = [
    {
        name: 'Nicolas',
        email: 'nicolas@email.com',
    },
    {
        name: 'Rinor',
        email: 'rinor@email.com',
    },
    {
        name: 'Arita',
        email: 'arita@email.com',
    },
];

const items: Prisma.ItemCreateInput[] = [
    {
        title: 'Laptop',
        image: 'laptop.jpg',
    },
    {
        title: 'Bicycle',
        image: 'bicycle.jpg',
    },
    {
        title: 'Car',
        image: 'car.jpg',
    },
    {
        title: 'Table',
        image: 'table.jpg',
    },
    {
        title: 'Shelf',
        image: 'shelf.jpg',
    },
    {
        title: 'Bed',
        image: 'bed.jpg',
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
