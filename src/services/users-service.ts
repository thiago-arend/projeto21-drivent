import { TicketStatus, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { eventsService } from '@/services';
import { cannotEnrollBeforeStartDateError, duplicatedEmailError, notFoundError } from '@/errors';
import { enrollmentRepository, ticketsRepository, userRepository } from '@/repositories';
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

async function validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow(userId: number): Promise<void> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  if (ticket.status !== TicketStatus.PAID || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote)
    throw paymentRequiredError();
}

export type CreateUserParams = Pick<User, 'email' | 'password'>;

export const userService = {
  createUser,
  validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow,
};
