import faker from '@faker-js/faker';
import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export function mockHotel(): Hotel {
  return {
    id: faker.datatype.number({ min: 1, max: 100 }),
    name: faker.name.lastName(),
    image: faker.image.imageUrl(),
    createdAt: faker.date.soon(),
    updatedAt: faker.date.soon(),
  };
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '1020',
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export function mockRoomWithHotelId(hotelId: number): Room {
  return {
    id: faker.datatype.number({ min: 1, max: 100 }),
    name: faker.name.lastName(),
    capacity: faker.datatype.number({ min: 1, max: 4 }),
    hotelId,
    createdAt: faker.date.soon(),
    updatedAt: faker.date.soon(),
  };
}
