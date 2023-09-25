import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { paymentController } from '@/controllers/payments-controller';

const paymentsRouter = Router();

paymentsRouter.all('/*', authenticateToken).get('/').post('/process', paymentController.create);

export { paymentsRouter };
