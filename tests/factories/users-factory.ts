import bcrypt from 'bcrypt';
import faker from '@faker-js/faker';
import { TicketStatus, User } from '@prisma/client';
import {
  createBooking,
  createEnrollmentWithAddress,
  createHotel,
  createRandomTicketType,
  createRoom,
  createTicket,
  createTicketType,
} from './index';
import { prisma } from '@/config';

export async function createUser(params: Partial<User> = {}): Promise<User> {
  const incomingPassword = params.password || faker.internet.password(6);
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);

  return prisma.user.create({
    data: {
      email: params.email || faker.internet.email(),
      password: hashedPassword,
    },
  });
}

export async function createUserWithTicket(isRemote: boolean, includesHotel: boolean, isPaid: boolean): Promise<User> {
  const user = await createUser();
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketType(isRemote, includesHotel);
  await createTicket(enrollment.id, ticketType.id, isPaid ? TicketStatus.PAID : TicketStatus.RESERVED);

  return user;
}

export async function createUserWithOnlyHotel(): Promise<User> {
  const user = await createUser();
  const hotel = await createHotel();
  const room = await createRoom(hotel.id);
  await createBooking(user.id, room.id);

  return user;
}

export async function createUserWithOnlyEnrollmentAndTicket(): Promise<User> {
  const user = await createUser();
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createRandomTicketType();
  await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

  return user;
}

export async function createUserWithOnlyEnrollment(): Promise<User> {
  const user = await createUser();
  await createEnrollmentWithAddress(user);

  return user;
}

export async function createUserWithOnlyEnrollmentAndHotel(): Promise<User> {
  const user = await createUser();
  await createEnrollmentWithAddress(user);
  const hotel = await createHotel();
  const room = await createRoom(hotel.id);
  await createBooking(user.id, room.id);

  return user;
}
