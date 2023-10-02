import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const hotels = await hotelsService.getHotels(req.userId);

    res.status(httpStatus.OK).send(hotels);
}

export async function getHotelWithRooms(req: AuthenticatedRequest, res: Response) {
    const { hotelId } = req.params;
    
    const hotelWithRooms = await hotelsService.getHotelWithRooms(Number(hotelId), req.userId);

    res.status(httpStatus.OK).send(hotelWithRooms);
}

export const hotelsController = { getHotels, getHotelWithRooms };
