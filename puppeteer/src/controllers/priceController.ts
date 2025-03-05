import { Request, Response } from 'express';
import { getLatestPrices } from '../models/priceModels';

// Get the latest prices
export const getPrices = async (req: Request, res: Response) => {
    try {
        const prices = await getLatestPrices();
        res.status(200).json(prices);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching prices', error: error.message });
    }
};

// Get the price difference
export const getPriceDifference = async (req: Request, res: Response) => {
    try {
        const prices = await getLatestPrices();
        if (prices.length < 2) {
            return res.status(400).json({ message: 'Not enough data to calculate difference.' });
        }

        const wallgoldPrice = prices.find(p => p.website === 'Wallgold')!.price;
        const talaseaPrice = prices.find(p => p.website === 'Talasea')!.price;
        const difference = Math.abs(wallgoldPrice - talaseaPrice);

        res.status(200).json({ wallgoldPrice, talaseaPrice, difference });
    } catch (error: any) {
        res.status(500).json({ message: 'Error calculating price difference', error: error.message });
    }
};