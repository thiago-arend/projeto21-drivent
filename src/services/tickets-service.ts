import { cannotBuyMoreThanOneTicketError } from "@/errors/cannot-buy-more-than-one-ticket-error";
import { cannotBuyTicketIfEnrollmentNotExistsError } from "@/errors/cannot-buy-ticket-if-enrollment-not-exists-error";
import { cannotGetTicketIfEnrollmentNotExistsError } from "@/errors/cannot-get-ticket-if-enrollment-not-exists-error";
import { missingTicketTypeIdError } from "@/errors/missing-ticket-type-id";
import { userHasNoTicketError } from "@/errors/user-has-no-ticket-error";
import { CreateTicket, TicketAndType } from "@/protocols";
import { enrollmentRepository } from "@/repositories";
import { ticketsRepository } from "@/repositories/tickets-repository";
import { Ticket, TicketStatus, TicketType } from "@prisma/client";

async function getTicketsTypes(): Promise<TicketType[]> {
    const ticketsTypes = await ticketsRepository.getTicketsTypes();
    return ticketsTypes;
}

async function create(ticketTypeId: number, userId: number): Promise<TicketAndType> {
    if (!ticketTypeId) throw missingTicketTypeIdError();

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw cannotBuyTicketIfEnrollmentNotExistsError();

    const ticket = await ticketsRepository.getTicketByEnrollmentId(enrollment.id);
    if (ticket) throw cannotBuyMoreThanOneTicketError();

    const createTicket: CreateTicket = {
        ticketTypeId,
        enrollmentId: enrollment.id,
        status: TicketStatus.RESERVED
    }

    return await ticketsRepository.create(createTicket);
}

async function getTicketByUserId(userId: number): Promise<Ticket> {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw cannotGetTicketIfEnrollmentNotExistsError();

    const ticket = await ticketsRepository.getTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw userHasNoTicketError();

    return ticket;
}

export const ticketsService = { getTicketsTypes, create, getTicketByUserId };