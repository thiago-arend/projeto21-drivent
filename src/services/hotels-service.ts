import { HotelWithRooms } from "@/protocols";
import { hotelsRepository } from "@/repositories";
import { Hotel } from "@prisma/client";
import { userService } from ".";

export async function getHotels(userId: number): Promise<Hotel[]> {
    await userService.validateIfUserHasEnrollmentTicketAndHotelOrThrow(userId);
    await userService.validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow(userId);
    
    const hotels = await hotelsRepository.getHotels();

    return hotels;
}

export async function getHotelWithRooms(id: number, userId: number): Promise<HotelWithRooms> {
    await userService.validateIfUserHasEnrollmentTicketAndHotelOrThrow(userId);
    await userService.validateIfUserHasEnrollmentWithPaidTicketThatIncludesHotelOrThrow(userId);
    const hotelWithRooms = await hotelsRepository.getHotelWithRooms(id);

    return hotelWithRooms;
}

export const hotelsService = { getHotels, getHotelWithRooms };