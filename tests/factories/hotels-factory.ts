import faker from '@faker-js/faker';
import { Hotel } from '@prisma/client';
import { prisma } from '@/config';
import { HotelInput, HotelWithRooms, RoomInput } from '@/protocols';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export function createHotelInputObject(): HotelInput {
  return {
    name: faker.company.companyName(),
    image: faker.image.imageUrl(),
  };
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.commerce.color(),
      capacity: faker.datatype.number(),
      hotelId,
    },
  });
}

export function createRoomInputObject(): RoomInput {
  return {
    name: faker.commerce.color(),
    capacity: faker.datatype.number(),
  };
}

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export async function createHotelWithRooms(): Promise<Hotel> {
  const hotel = await createHotel();
  const roomsQuantity = Math.floor(Math.random() * (50 - 30 + 1) + 30);
  for (let i = 0; i < roomsQuantity; i++) {
    await createRoom(hotel.id);
  }

  return hotel;
}

export async function createHotelWithRoomsReturningNestedObject(): Promise<HotelWithRooms> {
  const rooms = [];
  for (let i = 0; i < 30; i++) {
    rooms.push(createRoomInputObject());
  }

  return prisma.hotel.create({
    data: {
      ...createHotelInputObject(),
      Rooms: {
        createMany: { data: rooms },
      },
    },
    include: {
      Rooms: true,
    },
  });
}
