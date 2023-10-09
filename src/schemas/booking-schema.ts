import Joi from 'joi';
import { InputBookingBody, InputBookingParams } from '@/protocols';

export const bookingBodySchema = Joi.object<InputBookingBody>({
  roomId: Joi.number().min(1).required(),
});

export const bookingParamsSchema = Joi.object<InputBookingParams>({
  bookingId: Joi.number().min(1).required(),
});
