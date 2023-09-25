import { ticketsController } from '@/controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

const ticketsRouter = Router();

ticketsRouter
    .all('/*', authenticateToken)
    .get('/types', ticketsController.getTicketsTypes)
    .post('/', ticketsController.create)
    .get('/', ticketsController.get)

export { ticketsRouter };
