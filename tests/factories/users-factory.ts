import bcrypt from 'bcrypt';
import faker from '@faker-js/faker';
import { TicketStatus, User } from '@prisma/client';
import { prisma } from '@/config';
import { createEnrollmentWithAddress, createTicket, createTicketType } from './index';

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
