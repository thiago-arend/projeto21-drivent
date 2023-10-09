import faker from '@faker-js/faker';
import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType(isRemote?: boolean, includesHotel?: boolean) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: isRemote !== undefined ? isRemote : faker.datatype.boolean(),
      includesHotel: includesHotel !== undefined ? includesHotel : faker.datatype.boolean(),
    },
  });
}

export function mockTicketType(isRemote?: boolean, includesHotel?: boolean): TicketType {
  return {
    id: faker.datatype.number({ min: 1 }),
    name: faker.name.findName(),
    price: faker.datatype.number(),
    isRemote: isRemote !== undefined ? isRemote : false,
    includesHotel: includesHotel !== undefined ? includesHotel : true,
    createdAt: faker.date.soon(),
    updatedAt: faker.date.soon(),
  };
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export function mockTicket(ticketTypeId: number, enrollmentId: number, status: TicketStatus): Ticket {
  return {
    id: faker.datatype.number({ min: 1 }),
    ticketTypeId,
    enrollmentId,
    status,
    createdAt: faker.date.soon(),
    updatedAt: faker.date.soon(),
  };
}
