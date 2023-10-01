import faker from '@faker-js/faker';
import { Hotel } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
    createUser,
    createUserWithTicket,
    createHotelWithRooms,
    createHotelWithRoomsReturningNestedObject
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it("should respond with 404 if user has no enrollment or ticket or there is no hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with 402 if ticket hasn't been paid", async () => {
            const user = await createUserWithTicket(faker.datatype.boolean(), faker.datatype.boolean(), false);
            const token = await generateValidToken(user);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with 402 if ticket is remote", async () => {
            const user = await createUserWithTicket(true, faker.datatype.boolean(), faker.datatype.boolean());
            const token = await generateValidToken(user);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with 402 if ticket does not include hotel", async () => {
            const user = await createUserWithTicket(faker.datatype.boolean(), false, faker.datatype.boolean());
            const token = await generateValidToken(user);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with 200 and three hotel objects", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            for (let i = 0; i < 3; i++) await createHotelWithRooms();

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
                        updatedAt: expect.any(String)
                    })
                ])
            )
        });
    });
});

describe("GET /hotels/:hotelId", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels/1");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it("should respond with 404 if user has no enrollment or ticket or there is no hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.get(`/hotels/${Number.MAX_SAFE_INTEGER}}`).set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with 402 if ticket hasn't been paid", async () => {
            const user = await createUserWithTicket(faker.datatype.boolean(), faker.datatype.boolean(), false);
            const token = await generateValidToken(user);

            const response = await server.get(`/hotels/${Number.MAX_SAFE_INTEGER}}`).set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with 402 if ticket is remote", async () => {
            const user = await createUserWithTicket(true, faker.datatype.boolean(), faker.datatype.boolean());
            const token = await generateValidToken(user);

            const response = await server.get(`/hotels/${Number.MAX_SAFE_INTEGER}}`).set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with 402 if ticket does not include hotel", async () => {
            const user = await createUserWithTicket(faker.datatype.boolean(), false, faker.datatype.boolean());
            const token = await generateValidToken(user);

            const response = await server.get(`/hotels/${Number.MAX_SAFE_INTEGER}}`).set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with 200 and hotel with rooms", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const HotelWithRooms = await createHotelWithRoomsReturningNestedObject();

            const { status, body } = await server.get(`/hotels/${HotelWithRooms.id}`).set('Authorization', `Bearer ${token}`);

            expect(status).toBe(httpStatus.OK);
            expect(body).toEqual(HotelWithRooms);
        });
    });
});