import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';

import { TicketStatus } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser, createBooking } from '../factories';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should return status 200 and body containing booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const { status, body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.OK);
      expect(body).toEqual(
        expect.objectContaining({
          id: booking.id,
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          },
        }),
      );
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking').send({});

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({});

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({});

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should return 400 if body is not present', async () => {
      const token = await generateValidToken();

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe('when body is valid', () => {
      it('should respond with status 200 and object with booking id', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const { status, body } = await server
          .post('/booking')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: room.id });

        expect(status).toBe(httpStatus.OK);
        expect(body).toEqual(
          expect.objectContaining({
            bookingId: expect.any(Number),
          }),
        );
      });
    });
  });
});

describe('POST /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1').send({});

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({});

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({});

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should return 400 if body is not present', async () => {
      const token = await generateValidToken();

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when param bookingId is not valid', async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe('when body is valid', () => {
      it('should respond with status 200 and object with booking id', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const previousRoom = await createRoomWithHotelId(hotel.id);

        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const booking = await createBooking(user.id, previousRoom.id);
        const futureRoom = await createRoomWithHotelId(hotel.id);

        const { status, body } = await server
          .put(`/booking/${booking.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: futureRoom.id });

        expect(status).toBe(httpStatus.OK);
        expect(body).toEqual(
          expect.objectContaining({
            bookingId: booking.id,
          }),
        );
      });
    });
  });
});
