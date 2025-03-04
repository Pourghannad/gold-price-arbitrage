import express from 'express';
import { getPrices, getPriceDifference } from '../controllers/priceController';

const router = express.Router();

// Define routes
router.get('/prices', getPrices);
router.get('/price-difference', getPriceDifference);

export default router;