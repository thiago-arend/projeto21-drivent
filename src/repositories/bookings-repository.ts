import { prisma } from '@/config';
import { BookingWithRoomRaw, CreateBookingParams } from '@/protocols';
import { Booking } from '@prisma/client';

async function getBookingByUserId(userId: number): Promise<BookingWithRoomRaw> {
    return await prisma.booking.findUnique({
        where: { userId },
        include: {
            Room: true
        }
    });
}

async function createBooking(booking: CreateBookingParams): Promise<Booking> {
    return await prisma.booking.create({
        data: booking
    });
}

async function changeBookingRoomByUserId(userId: number, roomId: number): Promise<Booking> {
    return await prisma.booking.update({
        where: { userId },
        data: { roomId }
    });
}

async function getBookingsCountByRoomId(roomId: number) {
    return await prisma.booking.count({
        where: { roomId }
    });
}

export const bookingRepository = {
    getBookingByUserId,
    createBooking,
    changeBookingRoomByUserId,
    getBookingsCountByRoomId,
}