import { TicketStatus, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { eventsService } from '@/services';
import { cannotEnrollBeforeStartDateError, duplicatedEmailError, notFoundError } from '@/errors';
import { enrollmentRepository, hotelsRepository, ticketsRepository, userRepository } from '@/repositories';
import { boolean } from 'joi';
import { paymentRequiredError } from '@/errors/payment-required-error';

export async function createUser({ email, password }: CreateUserParams): Promise<User> {
  await canEnrollOrFail();

  await validateUniqueEmailOrFail(email);

  const hashedPassword = await bcrypt.hash(password, 12);
  return userRepository.create({
    email,
    password: hashedPassword,
  });
}

async function validateUniqueEmailOrFail(email: string) {
  const userWithSameEmail = await userRepository.findByEmail(email);
  if (userWithSameEmail) {
    throw duplicatedEmailError();
  }
}

async function canEnrollOrFail() {
  const canEnroll = await eventsService.isCurrentEventActive();
  if (!canEnroll) {
    throw cannotEnrollBeforeStartDateError();
  }
}

async function userHasEnrollment(userId: number): Promise<boolean> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (enrollment) return true;
  return false;
}

async function userHasTicket(userId: number): Promise<boolean> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (ticket) return true;
  return false;
}

async function userHasHotel(userId: number): Promise<boolean> {
  const booking = await hotelsRepository.getBookingByUserId(userId);
  if (!booking) throw notFoundError();
  const room = await hotelsRepository.getRoom(booking.roomId);
  if (!room) throw notFoundError();
  const hotel = await hotelsRepository.getHotel(room.hotelId);

  if (hotel) return true;
  return false;
}

async function validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow(userId: number): Promise<void> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw paymentRequiredError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== TicketStatus.PAID || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) throw paymentRequiredError();
}

async function validateIfUserHasEnrollmentTicketAndHotelOrThrow(userId: number): Promise<void> {
  if (!await userHasHotel(userId)) throw notFoundError();
  if (!await userHasEnrollment(userId)) throw notFoundError();
  if (!await userHasTicket(userId)) throw notFoundError();
}

export type CreateUserParams = Pick<User, 'email' | 'password'>;

export const userService = {
  createUser,
  validateIfUserHasEnrollmentTicketAndHotelOrThrow,
  validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow,
};
