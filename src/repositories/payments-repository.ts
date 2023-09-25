import { Payment } from '@prisma/client';
import { prisma } from '@/config';
import { CreatePayment } from '@/protocols';

async function create(createTicket: CreatePayment): Promise<Payment> {
  const payment = await prisma.payment.create({
    data: createTicket,
  });

  return payment;
}

export const paymentRepository = { create };
