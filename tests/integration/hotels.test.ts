import faker from '@faker-js/faker';
import { Hotel, TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createUser,
  createUserWithTicket,
  createHotelWithRoomsReturningNestedObject,
  createUserWithOnlyEnrollmentAndHotel,
  createUserWithOnlyEnrollment,
  createUserWithOnlyEnrollmentAndTicket,
  createUserWithOnlyHotel,
  createBooking,
  createEnrollmentWithAddress,
  createTicket,
  createTicketType,
} from '../factories';
import { cleanDb, generateRandomNumber, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with 404 if user has no enrollment or ticket or there is no hotel', async () => {
      const userWithNone = await createUser();
      const token = await generateValidToken(userWithNone);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyHotel = await createUserWithOnlyHotel();
      const token2 = await generateValidToken(userWithOnlyHotel);

      const response2 = await server.get('/hotels').set('Authorization', `Bearer ${token2}`);

      expect(response2.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyEnrollmentAndTicket = await createUserWithOnlyEnrollmentAndTicket();
      const token3 = await generateValidToken(userWithOnlyEnrollmentAndTicket);

      const response3 = await server.get('/hotels').set('Authorization', `Bearer ${token3}`);

      expect(response3.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyEnrollment = await createUserWithOnlyEnrollment();
      const token4 = await generateValidToken(userWithOnlyEnrollment);

      const response4 = await server.get('/hotels').set('Authorization', `Bearer ${token4}`);

      expect(response4.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyEnrollmentAndHotel = await createUserWithOnlyEnrollmentAndHotel();
      const token5 = await generateValidToken(userWithOnlyEnrollmentAndHotel);

      const response5 = await server.get('/hotels').set('Authorization', `Bearer ${token5}`);

      expect(response5.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with 402 if ticket hasn't been paid", async () => {
      const user = await createUserWithTicket(false, true, false);
      const token = await generateValidToken(user);

      const hotelWithRooms = await createHotelWithRoomsReturningNestedObject();
      const randomInteger = generateRandomNumber(0, hotelWithRooms.Rooms.length - 1);
      await createBooking(user.id, hotelWithRooms.Rooms[randomInteger].id);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticket is remote', async () => {
      const user = await createUserWithTicket(true, true, true);
      const token = await generateValidToken(user);

      const hotelWithRooms = await createHotelWithRoomsReturningNestedObject();
      const randomInteger = generateRandomNumber(0, hotelWithRooms.Rooms.length - 1);
      await createBooking(user.id, hotelWithRooms.Rooms[randomInteger].id);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticket does not include hotel', async () => {
      const user = await createUserWithTicket(false, false, true);
      const token = await generateValidToken(user);

      const hotelWithRooms = await createHotelWithRoomsReturningNestedObject();
      const randomInteger = generateRandomNumber(0, hotelWithRooms.Rooms.length - 1);
      await createBooking(user.id, hotelWithRooms.Rooms[randomInteger].id);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 200 and three hotel objects', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const hotelsWithRooms = [];
      for (let i = 0; i < 3; i++) {
        hotelsWithRooms.push(await createHotelWithRoomsReturningNestedObject());
      }

      const randomHotel = generateRandomNumber(0, 2);
      const randomRoom = generateRandomNumber(0, hotelsWithRooms[randomHotel].Rooms.length - 1);

      await createBooking(user.id, hotelsWithRooms[randomHotel].Rooms[randomRoom].id);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const { status, body } = await server.get(`/hotels`).set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.OK);
      expect(body).toHaveLength(3);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining<Hotel>({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      );
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with 404 if user has no enrollment or ticket or there is no hotel', async () => {
      const userWithNone = await createUser();
      const token = await generateValidToken(userWithNone);

      const response = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyHotel = await createUserWithOnlyHotel();
      const token2 = await generateValidToken(userWithOnlyHotel);

      const response2 = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(response2.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyEnrollmentAndTicket = await createUserWithOnlyEnrollmentAndTicket();
      const token3 = await generateValidToken(userWithOnlyEnrollmentAndTicket);

      const response3 = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token3}`);

      expect(response3.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyEnrollment = await createUserWithOnlyEnrollment();
      const token4 = await generateValidToken(userWithOnlyEnrollment);

      const response4 = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token4}`);

      expect(response4.status).toBe(httpStatus.NOT_FOUND);

      const userWithOnlyEnrollmentAndHotel = await createUserWithOnlyEnrollmentAndHotel();
      const token5 = await generateValidToken(userWithOnlyEnrollmentAndHotel);

      const response5 = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token5}`);

      expect(response5.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with 402 if ticket hasn't been paid", async () => {
      const user = await createUserWithTicket(false, true, false);
      const token = await generateValidToken(user);

      const hotelWithRooms = await createHotelWithRoomsReturningNestedObject();
      const randomInteger = generateRandomNumber(0, hotelWithRooms.Rooms.length - 1);
      await createBooking(user.id, hotelWithRooms.Rooms[randomInteger].id);

      const response = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticket is remote', async () => {
      const user = await createUserWithTicket(true, true, true);
      const token = await generateValidToken(user);

      const hotelWithRooms = await createHotelWithRoomsReturningNestedObject();
      const randomInteger = generateRandomNumber(0, hotelWithRooms.Rooms.length - 1);
      await createBooking(user.id, hotelWithRooms.Rooms[randomInteger].id);

      const response = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticket does not include hotel', async () => {
      const user = await createUserWithTicket(false, false, true);
      const token = await generateValidToken(user);

      const hotelWithRooms = await createHotelWithRoomsReturningNestedObject();
      const randomInteger = generateRandomNumber(0, hotelWithRooms.Rooms.length - 1);
      await createBooking(user.id, hotelWithRooms.Rooms[randomInteger].id);

      const response = await server
        .get(`/hotels/${generateRandomNumber(0, 100)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 200 and hotel with rooms', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const hotelWithRooms = await createHotelWithRoomsReturningNestedObject();
      const hotelWithRoomsParsed = {
        ...hotelWithRooms,
        Rooms: hotelWithRooms.Rooms.map((room) => {
          return { ...room, createdAt: room.createdAt.toISOString(), updatedAt: room.updatedAt.toISOString() };
        }),
        createdAt: hotelWithRooms.createdAt.toISOString(),
        updatedAt: hotelWithRooms.updatedAt.toISOString(),
      };

      const randomInteger = generateRandomNumber(0, hotelWithRoomsParsed.Rooms.length - 1);
      await createBooking(user.id, hotelWithRoomsParsed.Rooms[randomInteger].id);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const { status, body } = await server.get(`/hotels/${hotelWithRooms.id}`).set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.OK);
      expect(body).toEqual(hotelWithRoomsParsed);
    });
  });
});
