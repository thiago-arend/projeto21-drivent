import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services';
import { CreateBookingParams, RoomId } from '@/protocols';

export async function getBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req;

  const booking = await bookingService.getBookingByUserId(userId);

  res.status(httpStatus.OK).send(booking);
}

export async function createBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req;
  const { roomId } = req.body as RoomId;

  const bookingParams: CreateBookingParams = { userId, roomId }
  const booking = await bookingService.createBooking(userId, bookingParams);

  res.status(httpStatus.OK).send(booking);
}

export async function changeBookingRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req;
}
