import { prisma } from '@/config';
import { CreateTicket, TicketAndType } from '@/protocols';
import { Ticket, TicketType } from '@prisma/client';

async function getTicketsTypes(): Promise<TicketType[]> {
    const ticketsTypes = await prisma.ticketType.findMany();
    return ticketsTypes;
}

async function create(ticket: CreateTicket): Promise<TicketAndType> {
    const ticketAndType = await prisma.ticket.create({
        data: ticket,
        include: {
            TicketType: true
        }
    });

    return ticketAndType;
}

async function getTicketByEnrollmentId(id: number): Promise<Ticket> {
    const ticket = await prisma.ticket.findUnique({
        where: { enrollmentId: id },
        include: {
            TicketType: true
        }
    });

    return ticket;
}

export const ticketsRepository = { getTicketsTypes, create, getTicketByEnrollmentId };