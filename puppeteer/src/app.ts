import express from 'express';
import priceRoutes from './routes/priceRoutes';
import { createTable } from './models/priceModel';
import { fetchAllPrices } from './services/crawlerService';
import cron from 'node-cron';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', priceRoutes);

// Initialize database and start crawler
const initialize = async () => {
    await createTable();
    console.log('Database table created.');

    // Fetch prices immediately
    await fetchAllPrices();

    // Schedule the crawler to run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        console.log('Fetching prices...');
        fetchAllPrices();
    });
};

initialize();

export default app;