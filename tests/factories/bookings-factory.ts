import faker from '@faker-js/faker';
import { Booking } from '@prisma/client';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number): Promise<Booking> {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export function mockBooking(userId: number, roomId: number): Booking {
  return {
    id: faker.datatype.number({ min: 1, max: 100 }),
    userId,
    roomId,
    createdAt: faker.date.soon(),
    updatedAt: faker.date.soon(),
  };
}
