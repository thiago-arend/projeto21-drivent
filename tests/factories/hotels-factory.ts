import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
    return prisma.hotel.create({
        data: {
            name: faker.company.companyName(),
            image: faker.image.imageUrl()
        }
    });
}

export async function createRoom(hotelId: number) {
    return prisma.room.create({
        data: {
            name: faker.commerce.color(),
            capacity: faker.datatype.number(),
            hotelId
        }
    });
}

export async function createBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    });
}

export async function createHotelWithRooms() {
    const hotel = await createHotel();
    const roomsQuantity = Math.floor(Math.random() * (50 - 30 + 1) + 30);
    for (let i = 0; i < roomsQuantity; i++) {
        await createRoom(hotel.id);
    }
}

