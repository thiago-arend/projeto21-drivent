import { Payment } from '@prisma/client';
import { incompletePaymentInformationError } from '@/errors/incomplete-payments-information-error';
import { ticketIdNotExistsError } from '@/errors/ticket-id-not-exists-error';
import { CreatePayment, PaymentBody } from '@/protocols';
import { paymentRepository } from '@/repositories/payments-repository';
import { ticketsRepository } from '@/repositories/tickets-repository';
import { userHasNoTicketIdError } from '@/errors/user-has-no-ticket-id-error';

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

export const paymentsService = { create };
