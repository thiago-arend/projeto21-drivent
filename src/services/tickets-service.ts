import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { CreateTicket, TicketAndType } from '@/protocols';
import { cannotBuyMoreThanOneTicketError, cannotBuyTicketIfEnrollmentNotExistsError, cannotGetTicketIfEnrollmentNotExistsError, missingTicketTypeIdError, userHasNoTicketError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';

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
    status: TicketStatus.RESERVED,
  };

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
