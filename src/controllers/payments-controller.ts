import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { PaymentBody } from '@/protocols';
import { paymentsService } from '@/services/payments-service';

async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const paymentBody = req.body as PaymentBody;

  const payment = await paymentsService.create(paymentBody, req.userId);
  res.status(httpStatus.OK).send(payment);
}

export const paymentController = { create };
