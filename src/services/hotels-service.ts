import { Hotel } from '@prisma/client';
import { userService } from '.';
import { HotelWithRooms } from '@/protocols';
import { hotelsRepository } from '@/repositories';
import { notFoundError } from '@/errors';

export async function getHotels(userId: number): Promise<Hotel[]> {
  await userService.validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow(userId);

  const hotels = await hotelsRepository.getHotels();
  if (hotels.length === 0) throw notFoundError();

  return hotels;
}

export async function getHotelWithRooms(id: number, userId: number): Promise<HotelWithRooms> {
  await userService.validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow(userId);
  const hotelWithRooms = await hotelsRepository.getHotelWithRooms(id);
  if (!hotelWithRooms) throw notFoundError();

  return hotelWithRooms;
}

export const hotelsService = { getHotels, getHotelWithRooms };
