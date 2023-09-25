import { Payment } from '@prisma/client';
import { CreatePayment, PaymentBody } from '@/protocols';
import { incompletePaymentInformationError, ticketIdNotExistsError, userHasNoTicketIdError } from '@/errors';
import { paymentRepository, ticketsRepository } from '@/repositories';

async function create(paymentBody: PaymentBody, userId: number): Promise<Payment> {
  const { ticketId, cardData } = paymentBody;

  if (!ticketId || !cardData) throw incompletePaymentInformationError();
  if (!(await ticketsRepository.getTicketById(ticketId))) throw ticketIdNotExistsError();
  if (!(await ticketsRepository.getTicketByIdAndUserId(ticketId, userId))) throw userHasNoTicketIdError();

  await ticketsRepository.updateStatusToPaid(ticketId);

  const createPayment: CreatePayment = {
    ticketId,
    value: await ticketsRepository.getValueForPaymentByTicketId(ticketId),
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.toString().slice(-4),
  };

  return await paymentRepository.create(createPayment);
}

async function getByTicketId(ticketId: number, userId: number): Promise<Payment> {
  if (!ticketId) throw incompletePaymentInformationError();
  if (!(await ticketsRepository.getTicketById(ticketId))) throw ticketIdNotExistsError();
  if (!(await ticketsRepository.getTicketByIdAndUserId(ticketId, userId))) throw userHasNoTicketIdError();

  const payment = await paymentRepository.getByTicketId(ticketId);
  return payment;
}

export const paymentsService = { create, getByTicketId };
