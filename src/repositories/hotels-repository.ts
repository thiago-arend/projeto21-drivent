import { prisma } from '@/config';

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoom(id: number) {
  return prisma.room.findUnique({
    where: { id },
  });
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

export const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findRoom,
};
