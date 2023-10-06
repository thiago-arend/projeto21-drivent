import Joi from 'joi';
import { InputBookingBody, InputBookingParams } from '@/protocols';

export const bookingBodySchema = Joi.object<InputBookingBody>({
  roomId: Joi.number().required()
});

export const bookingParamsSchema = Joi.object<InputBookingParams>({
    bookingId: Joi.number().required()
  });
