import { prisma } from "@/config";
import { HotelWithRooms } from "@/protocols";
import { Booking, Hotel, Room } from "@prisma/client";

export async function getHotels(): Promise<Hotel[]> {
    return await prisma.hotel.findMany();
}

export async function getHotelWithRooms(id: number): Promise<HotelWithRooms> {
    const hotel = await prisma.hotel.findUnique({
        where: { id },
        include: { Rooms: true }
    });

    return hotel;
}

export async function getHotel(id: number): Promise<Hotel> {
    const hotel = await prisma.hotel.findUnique({
        where: { id }

    });

    return hotel;
}

export async function getRoom(id: number): Promise<Room> {
    const room = await prisma.room.findUnique({
        where: { id }

    });

    return room;
}

export async function getBookingByUserId(userId: number): Promise<Booking> {
    const booking = await prisma.booking.findFirst({
        where: { userId }
    });

    return booking;
}

export const hotelsRepository = { getHotels, getHotelWithRooms, getHotel, getBookingByUserId, getRoom };