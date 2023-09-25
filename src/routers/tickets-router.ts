import { Router } from 'express';
import { ticketsController } from '@/controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', ticketsController.getTicketsTypes)
  .post('/', ticketsController.create)
  .get('/', ticketsController.get);

export { ticketsRouter };
