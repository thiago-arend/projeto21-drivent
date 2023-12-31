import { TicketStatus } from '@prisma/client';
import { notFoundError } from '@/errors';
import { cannotCreateBookingError } from '@/errors/cannot-create-booking-error';
import { BookingId, BookingWithRoomCleaned, CreateBookingParams } from '@/protocols';
import { bookingRepository, enrollmentRepository, hotelRepository, ticketsRepository } from '@/repositories';

async function getBookingByUserId(userId: number): Promise<BookingWithRoomCleaned> {
  const booking = await bookingRepository.getBookingByUserId(userId);
  if (!booking) throw notFoundError();

  const cleanedBooking: BookingWithRoomCleaned = { id: booking.id, Room: booking.Room };

  return cleanedBooking;
}

async function createBooking(userId: number, booking: CreateBookingParams): Promise<BookingId> {
  await validateIfUserCanMakeBooking(userId);

  const room = await hotelRepository.findRoom(booking.roomId);
  if (!room) throw notFoundError();

  await validateIfRoomHasAvailableSpace(booking.roomId);

  const returnedBooking = await bookingRepository.createBooking(booking);

  return { bookingId: returnedBooking.id };
}

async function changeBookingRoomByUserId(userId: number, roomId: number): Promise<BookingId> {
  const room = await hotelRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  const booking = await bookingRepository.getBookingByUserId(userId);
  if (!booking) throw cannotCreateBookingError();

  await validateIfRoomHasAvailableSpace(roomId);

  const returnedBooking = await bookingRepository.changeBookingRoomByUserId(userId, roomId);

  return { bookingId: returnedBooking.id };
}

async function validateIfUserCanMakeBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw cannotCreateBookingError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw cannotCreateBookingError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw cannotCreateBookingError();
  }
}

async function validateIfRoomHasAvailableSpace(roomId: number) {
  const { capacity } = await hotelRepository.findRoom(roomId);
  const ocuppationCount = await bookingRepository.getBookingsCountByRoomId(roomId);
  const roomHasAvailableSpace = capacity > ocuppationCount;

  if (!roomHasAvailableSpace) {
    throw cannotCreateBookingError();
  }
}

export const bookingService = {
  getBookingByUserId,
  createBooking,
  changeBookingRoomByUserId,
};
