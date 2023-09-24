import { prisma } from '@/config';
import { TicketType } from '@prisma/client';

async function getTicketsTypes(): Promise<TicketType[]> {
    const ticketsTypes = await prisma.ticketType.findMany();
    return ticketsTypes;
}

export const ticketsRepository = { getTicketsTypes };