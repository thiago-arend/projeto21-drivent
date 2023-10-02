import { hotelsController } from '@/controllers';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

const hotelsRouter = Router();

hotelsRouter
    .all('/*', authenticateToken)
    .get('/', hotelsController.getHotels)
    .get('/:hotelId', hotelsController.getHotelWithRooms);

export { hotelsRouter };
