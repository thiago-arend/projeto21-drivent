import { Prisma, Ticket, TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';
import { CreateTicket, TicketAndType } from '@/protocols';

async function getTicketsTypes(): Promise<TicketType[]> {
  const ticketsTypes = await prisma.ticketType.findMany();
  return ticketsTypes;
}

async function create(ticket: CreateTicket): Promise<TicketAndType> {
  const ticketAndType = await prisma.ticket.create({
    data: ticket,
    include: { TicketType: true },
  });

  return ticketAndType;
}

async function getTicketByEnrollmentId(enrollmentId: number): Promise<Ticket> {
  const ticket = await prisma.ticket.findUnique({
    where: { enrollmentId },
    include: { TicketType: true },
  });

  return ticket;
}

async function getValueForPaymentByTicketId(ticketId: number): Promise<number> {
  const ticketAndType = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { TicketType: true },
  });

  return ticketAndType.TicketType.price;
}

async function getTicketById(id: number): Promise<Ticket> {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
  });

  return ticket;
}

async function getTicketByIdAndUserId(id: number, userId: number): Promise<Ticket> {
  const tickets = await prisma.$queryRaw<Ticket[]>(
    Prisma.sql`
      SELECT * FROM "Ticket" t
        JOIN "Enrollment" e ON t."enrollmentId"=e.id
        JOIN "User" u ON e."userId"=u.id
        WHERE u.id=${userId} AND t.id=${id};
    `,
  );

  return tickets[0];
}

async function updateStatusToPaid(id: number): Promise<void> {
  await prisma.ticket.update({
    where: { id },
    data: { status: TicketStatus.PAID },
  });
}

export const ticketsRepository = {
  getTicketsTypes,
  create,
  getTicketByEnrollmentId,
  getValueForPaymentByTicketId,
  getTicketById,
  updateStatusToPaid,
  getTicketByIdAndUserId,
};
