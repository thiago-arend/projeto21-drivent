import { ticketsRepository } from "@/repositories/tickets-repository";
import { TicketType } from "@prisma/client";

async function getTicketsTypes(): Promise<TicketType[]> {
    const ticketsTypes = await ticketsRepository.getTicketsTypes();
    return ticketsTypes;
}

export const ticketsService = { getTicketsTypes };