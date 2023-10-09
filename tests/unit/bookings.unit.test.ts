import { TicketStatus } from '@prisma/client';
import { mockAddress, mockBooking, mockEnrollment, mockTicket, mockTicketType, mockUser } from '../factories';
import { mockHotel, mockRoomWithHotelId } from '../factories/hotels-factory';
import { bookingRepository, enrollmentRepository, hotelRepository, ticketsRepository } from '@/repositories';
import { bookingService } from '@/services';
import { notFoundError } from '@/errors';
import { BookingWithRoomCleaned, BookingWithRoomRaw, CreateBookingParams } from '@/protocols';
import { cannotCreateBookingError } from '@/errors/cannot-create-booking-error';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('get booking tests', () => {
  it('should return 404 when there is no booking for given user', async () => {
    const user = mockUser();

    jest.spyOn(bookingRepository, 'getBookingByUserId').mockResolvedValueOnce(null);

    const promise = bookingService.getBookingByUserId(user.id);
    expect(bookingRepository.getBookingByUserId).toBeCalledTimes(1);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return a booking', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const booking = mockBooking(user.id, room.id);

    const bookingWithRoomRaw: BookingWithRoomRaw = {
      ...booking,
      Room: { ...room },
    };

    const bookingWithRoomCleaned: BookingWithRoomCleaned = {
      id: booking.id,
      Room: { ...room },
    };

    jest.spyOn(bookingRepository, 'getBookingByUserId').mockResolvedValueOnce(bookingWithRoomRaw);

    const promise = bookingService.getBookingByUserId(user.id);
    expect(bookingRepository.getBookingByUserId).toBeCalledTimes(1);
    expect(promise).resolves.toEqual(bookingWithRoomCleaned);
  });
});

describe('post booking tests', () => {
  it('should return 403 if user has no enrollment', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(null);

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(enrollmentRepository.findWithAddressByUserId).toBeCalledTimes(1);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it('should return 403 if user has no ticket', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const enrollment = mockEnrollment(user);
    const address = mockAddress(enrollment.id);
    const enrollmentWithAdress = { ...enrollment, Address: [{ ...address }] };

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollmentWithAdress);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(null);

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it("should return 403 if user's ticket was not paid", async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const enrollment = mockEnrollment(user);
    const address = mockAddress(enrollment.id);
    const enrollmentWithAdress = { ...enrollment, Address: [{ ...address }] };
    const ticketType = mockTicketType();
    const ticket = mockTicket(ticketType.id, enrollment.id, TicketStatus.RESERVED);

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollmentWithAdress);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType });

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it("should return 403 if user's ticket is remote", async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const enrollment = mockEnrollment(user);
    const address = mockAddress(enrollment.id);
    const enrollmentWithAdress = { ...enrollment, Address: [{ ...address }] };
    const ticketType = mockTicketType(true, undefined);
    const ticket = mockTicket(ticketType.id, enrollment.id, TicketStatus.PAID);

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollmentWithAdress);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType });

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it("should return 403 if user's ticket does not include hotel", async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const enrollment = mockEnrollment(user);
    const address = mockAddress(enrollment.id);
    const enrollmentWithAdress = { ...enrollment, Address: [{ ...address }] };
    const ticketType = mockTicketType(undefined, false);
    const ticket = mockTicket(ticketType.id, enrollment.id, TicketStatus.PAID);

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollmentWithAdress);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType });

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it('should return 404 if no room was not found', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const enrollment = mockEnrollment(user);
    const address = mockAddress(enrollment.id);
    const enrollmentWithAdress = { ...enrollment, Address: [{ ...address }] };
    const ticketType = mockTicketType();
    const ticket = mockTicket(ticketType.id, enrollment.id, TicketStatus.PAID);

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollmentWithAdress);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType });
    jest.spyOn(hotelRepository, 'findRoom').mockResolvedValueOnce(null);

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return 403 if room has no available space', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const enrollment = mockEnrollment(user);
    const address = mockAddress(enrollment.id);
    const enrollmentWithAdress = { ...enrollment, Address: [{ ...address }] };
    const ticketType = mockTicketType();
    const ticket = mockTicket(ticketType.id, enrollment.id, TicketStatus.PAID);

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollmentWithAdress);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType });
    jest.spyOn(hotelRepository, 'findRoom').mockImplementation((): any => {
      return room;
    });
    jest.spyOn(bookingRepository, 'getBookingsCountByRoomId').mockResolvedValueOnce(room.capacity);

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it('should return bookingId', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const enrollment = mockEnrollment(user);
    const address = mockAddress(enrollment.id);
    const enrollmentWithAdress = { ...enrollment, Address: [{ ...address }] };
    const ticketType = mockTicketType();
    const ticket = mockTicket(ticketType.id, enrollment.id, TicketStatus.PAID);

    const bookingInput: CreateBookingParams = {
      userId: user.id,
      roomId: room.id,
    };

    const booking = mockBooking(user.id, room.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollmentWithAdress);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType });
    jest.spyOn(hotelRepository, 'findRoom').mockImplementation((): any => {
      return room;
    });
    jest.spyOn(bookingRepository, 'getBookingsCountByRoomId').mockResolvedValueOnce(room.capacity - 1);
    jest.spyOn(bookingRepository, 'createBooking').mockResolvedValueOnce(booking);

    const promise = bookingService.createBooking(user.id, bookingInput);
    expect(promise).resolves.toEqual({ bookingId: booking.id });
  });
});

describe('put booking tests', () => {
  it('should return 404 if no room was not found', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);

    jest.spyOn(hotelRepository, 'findRoom').mockResolvedValueOnce(null);

    const promise = bookingService.changeBookingRoomByUserId(user.id, room.id);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return 403 if no booking was not found', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    // const booking = mockBooking(user.id, room.id);
    // { ...booking, Room: room }

    jest.spyOn(hotelRepository, 'findRoom').mockResolvedValueOnce(room);
    jest.spyOn(bookingRepository, 'getBookingByUserId').mockResolvedValueOnce(null);

    const promise = bookingService.changeBookingRoomByUserId(user.id, room.id);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it('should return 403 if room has no available space', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const booking = mockBooking(user.id, room.id);

    jest.spyOn(hotelRepository, 'findRoom').mockImplementation((): any => {
      return room;
    });
    jest.spyOn(bookingRepository, 'getBookingByUserId').mockResolvedValueOnce({ ...booking, Room: room });
    jest.spyOn(bookingRepository, 'getBookingsCountByRoomId').mockResolvedValueOnce(room.capacity);

    const promise = bookingService.changeBookingRoomByUserId(user.id, room.id);
    expect(promise).rejects.toEqual(cannotCreateBookingError());
  });

  it('should return bookingId', async () => {
    const user = mockUser();
    const hotel = mockHotel();
    const room = mockRoomWithHotelId(hotel.id);
    const booking = mockBooking(user.id, room.id);

    jest.spyOn(hotelRepository, 'findRoom').mockImplementation((): any => {
      return room;
    });
    jest.spyOn(bookingRepository, 'getBookingByUserId').mockResolvedValueOnce({ ...booking, Room: room });
    jest.spyOn(bookingRepository, 'getBookingsCountByRoomId').mockResolvedValueOnce(room.capacity - 1);
    jest.spyOn(bookingRepository, 'changeBookingRoomByUserId').mockResolvedValueOnce(booking);

    const promise = bookingService.changeBookingRoomByUserId(user.id, room.id);
    expect(promise).resolves.toEqual({ bookingId: booking.id });
  });
});
