import { cannotBuyMoreThanOneTicketError } from "@/errors/cannot-buy-more-than-one-ticket-error";
import { cannotBuyTicketIfEnrollmentNotExistsError } from "@/errors/cannot-buy-ticket-if-enrollment-not-exists-error";
import { missingTicketTypeIdError } from "@/errors/missing-ticket-type-id";
import { CreateTicket, TicketAndType } from "@/protocols";
import { enrollmentRepository } from "@/repositories";
import { ticketsRepository } from "@/repositories/tickets-repository";
import { TicketStatus, TicketType } from "@prisma/client";

async function getTicketsTypes(): Promise<TicketType[]> {
    const ticketsTypes = await ticketsRepository.getTicketsTypes();
    return ticketsTypes;
}

async function create(ticketTypeId: number, userId: number): Promise<TicketAndType> {
    if (!ticketTypeId) throw missingTicketTypeIdError();

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw cannotBuyTicketIfEnrollmentNotExistsError();

    if (await userEnrollmentHasTicketAlready(enrollment.id)) throw cannotBuyMoreThanOneTicketError();

    const createTicket: CreateTicket = {
        ticketTypeId,
        enrollmentId: enrollment.id,
        status: TicketStatus.RESERVED
    }

    return await ticketsRepository.create(createTicket);
}

async function userEnrollmentHasTicketAlready(enrollmenetId: number): Promise<boolean> {
    const ticketExists = await ticketsRepository.getTicketByEnrollmentId(enrollmenetId);

    if (ticketExists) return true;
    else return false;
}

export const ticketsService = { getTicketsTypes, create };