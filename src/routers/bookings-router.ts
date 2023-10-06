import { Router } from 'express';
import { authenticateToken, validateBody, validateParams } from '@/middlewares';
import { changeBookingRoom, createBooking, getBooking } from '@/controllers';
import { bookingBodySchema, bookingParamsSchema } from '@/schemas/booking-schema';

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .get('/', getBooking)
    .post('/', validateBody(bookingBodySchema), createBooking)
    .put('/:bookingId', validateParams(bookingParamsSchema), changeBookingRoom);

export { bookingRouter };
