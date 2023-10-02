import { Router } from 'express';
import { hotelsController } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter
  .all('/*', authenticateToken)
  .get('/', hotelsController.getHotels)
  .get('/:hotelId', hotelsController.getHotelWithRooms);

export { hotelsRouter };
